package com.rag.simple_rag.controller;

import com.rag.simple_rag.dto.ApiResponse;
import com.rag.simple_rag.dto.ChatMessageDto;
import com.rag.simple_rag.dto.ChatSessionDto;
import com.rag.simple_rag.entity.ChatSessionEntity;
import com.rag.simple_rag.service.ChatSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class ChatSessionController {

    private final ChatSessionService sessionService;

    @GetMapping
    public ResponseEntity<List<ChatSessionDto>> getUserSessions() {
        List<ChatSessionDto> sessions = sessionService.getUserSessions().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/{sessionId}/messages")
    public ResponseEntity<List<ChatMessageDto>> getSessionMessages(@PathVariable String sessionId) {
        return ResponseEntity.ok(sessionService.getSessionMessages(sessionId));
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<ApiResponse> deleteSession(@PathVariable String sessionId) {
        sessionService.deleteSession(sessionId);
        return ResponseEntity.ok(new ApiResponse(true, "Session deleted"));
    }

    private ChatSessionDto toDto(ChatSessionEntity entity) {
        return ChatSessionDto.builder()
                .sessionId(entity.getSessionId())
                .title(entity.getTitle())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
