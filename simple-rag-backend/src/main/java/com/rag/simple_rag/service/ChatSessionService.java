package com.rag.simple_rag.service;

import com.rag.simple_rag.dto.ChatMessageDto;
import com.rag.simple_rag.entity.ChatMessageEntity;
import com.rag.simple_rag.entity.ChatSessionEntity;
import com.rag.simple_rag.entity.User;
import com.rag.simple_rag.repository.ChatMessageRepository;
import com.rag.simple_rag.repository.ChatSessionRepository;
import com.rag.simple_rag.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatSessionService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Transactional
    public ChatSessionEntity createSession(String title) {
        ChatSessionEntity session = ChatSessionEntity.builder()
                .sessionId(UUID.randomUUID().toString())
                .user(currentUser())
                .title(title == null || title.isBlank() ? "New Chat" : title)
                .build();
        return sessionRepository.save(session);
    }

    public List<ChatSessionEntity> getUserSessions() {
        return sessionRepository.findByUser_EmailOrderByCreatedAtDesc(currentUser().getEmail());
    }

    public List<ChatMessageDto> getSessionMessages(String sessionId) {
        ChatSessionEntity session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getUser().getEmail().equals(currentUser().getEmail())) {
            throw new RuntimeException("Unauthorized access to chat session");
        }

        List<ChatMessageEntity> entities = messageRepository.findBySession_SessionIdOrderByCreatedAtAsc(sessionId);
        return entities.stream()
                .filter(entity -> !entity.getMessageType().equals("SYSTEM")) // Filter out internal system instructions
                .map(entity -> ChatMessageDto.builder()
                        .role(entity.getMessageType().equals("AI") ? "assistant" : "user")
                        .content(entity.getContent())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteSession(String sessionId) {
        sessionRepository.findById(sessionId).ifPresent(session -> {
            if (session.getUser().getEmail().equals(currentUser().getEmail())) {
                messageRepository.deleteBySession_SessionId(sessionId);
                sessionRepository.delete(session);
            }
        });
    }
}
