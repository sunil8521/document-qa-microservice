package com.rag.simple_rag.ai;

import dev.langchain4j.service.MemoryId;
import dev.langchain4j.service.Result;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.spring.AiService;
import dev.langchain4j.service.spring.AiServiceWiringMode;

@AiService(
        wiringMode = AiServiceWiringMode.AUTOMATIC,
        chatModel = "chatModel",
        chatMemoryProvider = "chatMemoryProvider",
        tools = {"retrieveTool"}
)
public interface AssistantAgent {

    @SystemMessage("""
        You are a helpful assistant.
        You have access to a searchTool that searches an internal knowledge base containing user-uploaded documents.
        When the user asks any question about their documents, skills, experience, resume, or any knowledge-base topic, ALWAYS use the searchTool first.
        For general greetings like "hi" or "hello", just respond normally without using the tool.
        If you don't know, say you don't know.
        """)
    Result<String> chat(@MemoryId String sessionId, @UserMessage String userMessage);
}
