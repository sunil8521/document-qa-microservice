package com.rag.simple_rag.controller;

import com.rag.simple_rag.ai.AssistantAgent;
import com.rag.simple_rag.dto.ApiResponse;
import com.rag.simple_rag.dto.ChatRequest;
import com.rag.simple_rag.service.ChatSessionService;
import dev.langchain4j.service.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final AssistantAgent assistantAgent;
    private final ChatSessionService sessionService;

    @PostMapping
    public ResponseEntity<ApiResponse> chat(@Valid @RequestBody ChatRequest request) {
        String sessionId = request.getSessionId();

        // Auto-create session if none provided — title comes from the first message
        if (sessionId == null || sessionId.isBlank()) {
            String title = request.getMessage().length() > 40
                    ? request.getMessage().substring(0, 40) + "..."
                    : request.getMessage();
            sessionId = sessionService.createSession(title).getSessionId();
        }

        // Get AI response with sources
        Result<String> result = assistantAgent.chat(sessionId, request.getMessage());
        String aiResponse = result.content();

        // Extract document IDs from retrieved sources (null if no docs used/matched)
        List<String> sourceDocumentIds = null;
        if (result.sources() != null && !result.sources().isEmpty()) {
            sourceDocumentIds = result.sources().stream()
                    .filter(content -> content.textSegment() != null)
                    .map(content -> content.textSegment().metadata().getString("document_id"))
                    .filter(Objects::nonNull)
                    .distinct()
                    .collect(Collectors.toList());

            if (sourceDocumentIds.isEmpty()) {
                sourceDocumentIds = null;
            }
        }

        log.info("[CHAT] Response: '{}', Source IDs: {}", aiResponse, sourceDocumentIds);

        return ResponseEntity.ok(new ApiResponse(true, aiResponse, sessionId, sourceDocumentIds));
    }
}
