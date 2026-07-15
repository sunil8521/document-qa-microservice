package com.rag.simple_rag.controller;

import com.rag.simple_rag.dto.ApiResponse;
import com.rag.simple_rag.dto.ConfirmUploadRequest;
import com.rag.simple_rag.dto.DocumentStatusResponse;
import com.rag.simple_rag.dto.PresignedUrlResponse;
import com.rag.simple_rag.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/presign")
    public ResponseEntity<PresignedUrlResponse> getPresignedUploadUrl(
            @RequestParam("fileName") String fileName,
            @RequestParam("fileType") String fileType,
            @RequestParam("fileSize") Long fileSize
    ) {
        PresignedUrlResponse response = documentService.generatePresignedUrl(fileName, fileType, fileSize);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse> confirmUpload(@RequestBody ConfirmUploadRequest request) {
        ApiResponse response = documentService.confirmUpload(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<?> getDocumentStatus(@PathVariable Long id) {
        DocumentStatusResponse response = documentService.getDocumentStatus(id);
        if (response == null) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Document not found."));
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<?> getUserDocuments() {
        return ResponseEntity.ok(documentService.getUserDocuments());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteDocument(@PathVariable Long id) {
        ApiResponse response = documentService.deleteDocument(id);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }
}
