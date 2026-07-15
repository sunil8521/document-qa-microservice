package com.document_worker.worker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

public class HealthController {
    @GetMapping("/")
    public ResponseEntity<String> checkHealth() {
        return ResponseEntity.ok("Server is running! 🚀");
    }
}
