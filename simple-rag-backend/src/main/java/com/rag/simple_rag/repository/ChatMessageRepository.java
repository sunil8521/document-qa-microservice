package com.rag.simple_rag.repository;

import com.rag.simple_rag.entity.ChatMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {
    List<ChatMessageEntity> findBySession_SessionIdOrderByCreatedAtAsc(String sessionId);

    @Transactional
    void deleteBySession_SessionId(String sessionId);
}
