package com.document_worker.worker.service;

import com.document_worker.worker.entity.DocumentEntity;
import com.document_worker.worker.repository.DocumentRepository;
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentParser;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.loader.FileSystemDocumentLoader;
import dev.langchain4j.data.document.parser.apache.tika.ApacheTikaDocumentParser;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentProcessingWorker {

    private final S3Client s3Client;
    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;
    private final DocumentRepository documentRepository;

    @Value("${r2.bucket-name}")
    private String bucketName;

    @RabbitListener(queues = "${cloudamqp.queue.name}")
    public void processFileJob(Long documentId) {
        log.info("[WORKER] Received processing job for document ID: {}", documentId);

        Optional<DocumentEntity> docOpt = documentRepository.findById(documentId);
        if (docOpt.isEmpty()) {
            log.error("[WORKER] Document record not found in DB for ID: {}", documentId);
            return;
        }

        DocumentEntity docEntity = docOpt.get();
        String fileKey = docEntity.getR2FileKey();
        docEntity.setStatus(DocumentEntity.DocumentStatus.PROCESSING);
        documentRepository.save(docEntity);

        Path tempFile = null;
        try {
            // 1. Download file from R2 to temp file
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build();

            tempFile = Files.createTempFile("worker-", "-" + docEntity.getFileName());
            try (ResponseInputStream<GetObjectResponse> r2Stream = s3Client.getObject(getRequest)) {
                Files.copy(r2Stream, tempFile, StandardCopyOption.REPLACE_EXISTING);
            }

            log.info("[WORKER] File downloaded to temp path: {}", tempFile);

            // 2. Parse with Tika
            DocumentParser documentParser = new ApacheTikaDocumentParser();
            Document document = FileSystemDocumentLoader.loadDocument(tempFile, documentParser);
            document.metadata().put("document_id", docEntity.getId().toString());

            log.info("[WORKER] Document successfully parsed. Total characters: {}", document.text().length());

            // 3. Chunk
            DocumentSplitter documentSplitter = DocumentSplitters.recursive(1000, 100);

            // 4. Embed and Store in pgvector
            log.info("[WORKER] Generating embeddings and saving to pgvector...");
            EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
                    .documentSplitter(documentSplitter)
                    .embeddingModel(embeddingModel)
                    .embeddingStore(embeddingStore)
                    .build();

            ingestor.ingest(document);

            log.info("[WORKER] Processing and pgvector storage complete for document ID: {}", docEntity.getId());

            // Mark completed
            docEntity.setStatus(DocumentEntity.DocumentStatus.COMPLETED);
            documentRepository.save(docEntity);

        } catch (Exception e) {
            log.error("[WORKER ERROR] Processing crashed for key {}: {}", fileKey, e.getMessage(), e);
            docEntity.setStatus(DocumentEntity.DocumentStatus.FAILED);
            documentRepository.save(docEntity);
        } finally {
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                } catch (IOException e) {
                    log.warn("Failed to delete temp file: {}", tempFile);
                }
            }
        }
    }
}
