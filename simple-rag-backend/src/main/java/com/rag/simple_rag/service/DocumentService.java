package com.rag.simple_rag.service;

import com.rag.simple_rag.dto.*;
import com.rag.simple_rag.entity.User;
import com.rag.simple_rag.entity.DocumentEntity;
import com.rag.simple_rag.repository.DocumentRepository;
import com.rag.simple_rag.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final S3Presigner s3Presigner;
    private final S3Client s3Client;
    private final RabbitTemplate rabbitTemplate;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    @Value("${r2.bucket-name}")
    private String bucketName;

    @Value("${cloudamqp.queue.name}")
    private String queueName;

    /**
     * Step 1: Generate a presigned URL for the client to upload directly to R2.
     * NO database record is created here — we only return the URL + fileKey.
     */
    public PresignedUrlResponse generatePresignedUrl(String fileName, String fileType, Long fileSize) {
        String lowerName = fileName.toLowerCase();
        if (!lowerName.endsWith(".pdf") && !lowerName.endsWith(".txt") && !lowerName.endsWith(".docx")) {
            return PresignedUrlResponse.builder()
                    .success(false)
                    .message("Only PDF, TXT, and DOCX files are allowed.")
                    .build();
        }

        String fileKey = "uploads/" + UUID.randomUUID() + "_" + fileName;

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .putObjectRequest(PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(fileKey)
                        .contentType(fileType)
                        .build())
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
        String uploadUrl = presignedRequest.url().toString();

        log.info("[SERVER] Presigned URL generated for '{}', fileKey={}", fileName, fileKey);

        return PresignedUrlResponse.builder()
                .success(true)
                .message("URL generated successfully")
                .uploadUrl(uploadUrl)
                .fileKey(fileKey)
                .build();
    }

    /**
     * Step 2: Confirm that the file was uploaded to R2, verify it exists,
     * THEN save to database and queue for processing.
     */
    public ApiResponse confirmUpload(ConfirmUploadRequest request) {
        String fileKey = request.getFileKey();

        // Validate fileKey format to prevent injection
        if (fileKey == null || !fileKey.matches("^uploads/[a-f0-9\\-]+_.+$")) {
            return new ApiResponse(false, "Invalid file key.");
        }

        // Verify the file actually exists in R2 via HEAD request
        try {
            s3Client.headObject(HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build());
        } catch (NoSuchKeyException e) {
            log.warn("[SERVER] Confirm called but file not found in R2: {}", fileKey);
            return new ApiResponse(false, "File not found in R2. Upload may have failed.");
        } catch (Exception e) {
            log.error("[SERVER] Error verifying file in R2: {}", e.getMessage(), e);
            return new ApiResponse(false, "Failed to verify file in R2.");
        }

        // File confirmed in R2 — now save to database
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        DocumentEntity doc = DocumentEntity.builder()
                .fileName(request.getFileName())
                .fileType(request.getFileType())
                .fileSize(request.getFileSize())
                .r2FileKey(fileKey)
                .status(DocumentEntity.DocumentStatus.UPLOADED)
                .user(currentUser)
                .build();
        doc = documentRepository.save(doc);

        log.info("[SERVER] Document confirmed and saved: documentId={}, fileKey={}", doc.getId(), fileKey);

        // Queue for worker processing
        rabbitTemplate.convertAndSend(queueName, doc.getId());
        log.info("[SERVER] Dispatched processing job to queue for documentId={}", doc.getId());

        return new ApiResponse(true, "Document confirmed and queued for processing.", doc.getId());
    }

    public DocumentStatusResponse getDocumentStatus(Long id) {
        DocumentEntity doc = documentRepository.findById(id).orElse(null);
        if (doc == null) {
            return null; // Controller will handle 404/bad request
        }
        return DocumentStatusResponse.builder()
                .documentId(doc.getId())
                .fileName(doc.getFileName())
                .status(doc.getStatus().name())
                .build();
    }

    public List<DocumentDto> getUserDocuments() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<DocumentEntity> docs = documentRepository.findByUser_IdOrderByUploadTimeDesc(currentUser.getId());
        
        return docs.stream().map(doc -> DocumentDto.builder()
                .id(doc.getId())
                .fileName(doc.getFileName())
                .fileType(doc.getFileType())
                .fileSize(doc.getFileSize())
                .status(doc.getStatus().name())
                .uploadTime(doc.getUploadTime())
                .build()
        ).collect(Collectors.toList());
    }

    /**
     * Delete a document: removes embeddings from pgvector, file from R2, and record from DB.
     * @Transactional ensures DB operations (embeddings + document record) are atomic.
     */
    @Transactional
    public ApiResponse deleteDocument(Long documentId) {
        DocumentEntity doc = documentRepository.findById(documentId).orElse(null);
        if (doc == null) {
            return new ApiResponse(false, "Document not found.");
        }

        // Verify ownership
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!doc.getUser().getId().equals(currentUser.getId())) {
            return new ApiResponse(false, "Not authorized to delete this document.");
        }

        // 1. Delete embeddings from pgvector via @Query (nativeQuery = true)
        try {
            int deleted = documentRepository.deleteEmbeddingsByDocumentId(documentId.toString());
            log.info("[SERVER] Deleted {} embedding rows for documentId={}", deleted, documentId);
        } catch (Exception e) {
            log.warn("[SERVER] Failed to delete embeddings for documentId={}: {}", documentId, e.getMessage());
        }

        // 2. Delete file from R2 (best-effort — external service)
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(doc.getR2FileKey())
                    .build());
            log.info("[SERVER] Deleted R2 object: {}", doc.getR2FileKey());
        } catch (Exception e) {
            log.warn("[SERVER] Failed to delete R2 object {}: {}", doc.getR2FileKey(), e.getMessage());
        }

        // 3. Delete from documents table
        documentRepository.delete(doc);
        log.info("[SERVER] Deleted document record: documentId={}", documentId);

        return new ApiResponse(true, "Document deleted successfully.");
    }
}
