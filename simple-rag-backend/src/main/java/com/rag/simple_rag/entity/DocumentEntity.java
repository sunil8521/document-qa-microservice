package com.rag.simple_rag.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileType;

    @Column(nullable = false)
    private Long fileSize;

    /** The object key in Cloudflare R2 bucket */
    @Column(nullable = false)
    private String r2FileKey;

    /** Processing status: UPLOADED, PROCESSING, COMPLETED, FAILED */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DocumentStatus status = DocumentStatus.UPLOADED;

    @Column(nullable = false)
    private LocalDateTime uploadTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private com.rag.simple_rag.entity.User user;

    @PrePersist
    public void prePersist() {
        this.uploadTime = LocalDateTime.now();
    }

    public enum DocumentStatus {
        UPLOADED,
        PROCESSING,
        COMPLETED,
        FAILED
    }
}
