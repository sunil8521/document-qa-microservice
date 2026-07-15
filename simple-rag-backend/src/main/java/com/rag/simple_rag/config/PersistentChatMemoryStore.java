package com.rag.simple_rag.config;

import com.rag.simple_rag.entity.ChatMessageEntity;
import com.rag.simple_rag.entity.ChatSessionEntity;
import com.rag.simple_rag.repository.ChatMessageRepository;
import com.rag.simple_rag.repository.ChatSessionRepository;
import dev.langchain4j.data.message.*;
import dev.langchain4j.store.memory.chat.ChatMemoryStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;


@Slf4j
@Component
@RequiredArgsConstructor
@Transactional
public class PersistentChatMemoryStore implements ChatMemoryStore {

    private final ChatMessageRepository repository;
    private final ChatSessionRepository sessionRepository;

    @Override
    public List<ChatMessage> getMessages(Object memoryId) {
        String sessionId = memoryId.toString();
        List<ChatMessageEntity> entities = repository.findBySession_SessionIdOrderByCreatedAtAsc(sessionId);
        List<ChatMessage> messages = new ArrayList<>();

        for (ChatMessageEntity entity : entities) {
            switch (entity.getMessageType()) {
                case "SYSTEM":
                    messages.add(new SystemMessage(entity.getContent()));
                    break;
                case "USER":
                    messages.add(new UserMessage(entity.getContent()));
                    break;
                case "AI":
                    messages.add(new AiMessage(entity.getContent()));
                    break;
            }
        }
        return messages;
    }

    @Override
    public void updateMessages(Object memoryId, List<ChatMessage> messages) {
        String sessionId = memoryId.toString();

        ChatSessionEntity session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found for ID: " + sessionId));

        // Delete existing rows for this session
        repository.deleteBySession_SessionId(sessionId);
        repository.flush();

        // Save each message from the window as a separate row
        List<ChatMessageEntity> entitiesToSave = new ArrayList<>();
        for (ChatMessage message : messages) {
            String type = "";
            String content = "";

            if (message instanceof SystemMessage) {
                continue;
            } else if (message instanceof UserMessage) {
                type = "USER";
                UserMessage userMsg = (UserMessage) message;
                content = userMsg.hasSingleText() ? userMsg.singleText() : "[Media Content]";
            } else if (message instanceof AiMessage) {
                type = "AI";
                content = ((AiMessage) message).text();
            }

            if (!type.isEmpty()) {
                entitiesToSave.add(ChatMessageEntity.builder()
                        .session(session)
                        .messageType(type)
                        .content(content)
                        .build());
            }
        }

        repository.saveAll(entitiesToSave);
    }

    @Override
    public void deleteMessages(Object memoryId) {
        repository.deleteBySession_SessionId(memoryId.toString());
    }
}
