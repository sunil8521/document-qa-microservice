package com.rag.simple_rag.ai;

import dev.langchain4j.service.MemoryId;
import dev.langchain4j.service.Result;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;

public interface AssistantAgent {

    @SystemMessage("""
            You are a helpful and concise AI assistant.
            Use the provided document context to answer the user's questions.
            If the answer is not contained in the documents, state that you do not know.
            """)
    Result<String> chat(@MemoryId String sessionId, @UserMessage String userMessage);
}

