package com.rag.simple_rag.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatSessionDto {
    private String sessionId;
    private String title;
    private LocalDateTime createdAt;
}
