package com.rag.simple_rag.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ApiResponse {
    private boolean success;
    private String message;
    private String sessionId;

    /** Document IDs from knowledge base used in the response, or null if none */
    private List<String> sourceDocumentIds;

    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public ApiResponse(boolean success, String message, String sessionId) {
        this.success = success;
        this.message = message;
        this.sessionId = sessionId;
    }

    /** Chat response with document source tracking */
    public ApiResponse(boolean success, String message, String sessionId, List<String> sourceDocumentIds) {
        this.success = success;
        this.message = message;
        this.sessionId = sessionId;
        this.sourceDocumentIds = sourceDocumentIds;
    }

    // Used by DocumentService (documentId is Long)
    private Long documentId;

    public ApiResponse(boolean success, String message, Long documentId) {
        this.success = success;
        this.message = message;
        this.documentId = documentId;
    }
}

