package com.rag.simple_rag.repository;

import com.rag.simple_rag.entity.ChatSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSessionEntity, String> {
    List<ChatSessionEntity> findByUser_EmailOrderByCreatedAtDesc(String email);
}
