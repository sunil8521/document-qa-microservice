package com.rag.simple_rag.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmUploadRequest {
    private String fileKey;
    private String fileName;
    private String fileType;
    private Long fileSize;
}
