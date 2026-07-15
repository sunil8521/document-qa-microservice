package com.rag.simple_rag.repository;

import com.rag.simple_rag.entity.DocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<DocumentEntity, Long> {

    List<DocumentEntity> findByUser_IdOrderByUploadTimeDesc(Long userId);

    /**
     * Delete all embedding chunks for a given document.
     * Uses native SQL because document_embeddings is a pgvector table (not a JPA entity)
     * and the query uses Postgres JSONB operator (->>).
     */
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM document_embeddings WHERE metadata->>'document_id' = :documentId", nativeQuery = true)
    int deleteEmbeddingsByDocumentId(@Param("documentId") String documentId);
}
