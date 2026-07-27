package com.rag.simple_rag.config;

import com.rag.simple_rag.ai.AssistantAgent;
import dev.langchain4j.memory.chat.ChatMemoryProvider;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.googleai.GoogleAiEmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.pgvector.PgVectorEmbeddingStore;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.rag.DefaultRetrievalAugmentor;
import dev.langchain4j.rag.RetrievalAugmentor;
import dev.langchain4j.rag.query.transformer.CompressingQueryTransformer;
import dev.langchain4j.service.AiServices;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.URI;

@Slf4j
@Configuration
public class AgentConfig {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model.name}")
    private String modelName;

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Bean
    public ChatModel chatModel() {
        return GoogleAiGeminiChatModel.builder()
                .apiKey(apiKey)
                .modelName(modelName)
                .temperature(0.7)
                .build();
    }

    @Bean
    public EmbeddingModel embeddingModel() {
        return GoogleAiEmbeddingModel.builder()
                .apiKey(apiKey)
                .modelName("gemini-embedding-001")
                .outputDimensionality(768)
                .taskType(GoogleAiEmbeddingModel.TaskType.RETRIEVAL_DOCUMENT)
                .build();
    }

    @Bean
    public EmbeddingStore<TextSegment> embeddingStore() throws Exception {
        String cleanUrl = dbUrl.replace("jdbc:", "");
        URI uri = new URI(cleanUrl);
        String host = uri.getHost();
        int port = uri.getPort() == -1 ? 5432 : uri.getPort();
        String database = uri.getPath().substring(1);

        return PgVectorEmbeddingStore.builder()
                .host(host)
                .port(port)
                .database(database)
                .user(dbUser)
                .password(dbPassword)
                .table("document_embeddings")
                .dimension(768)
                .createTable(true)
                .build();
    }

    @Bean("chatMemoryProvider")
    public ChatMemoryProvider chatMemoryProvider() {
        return memoryId -> MessageWindowChatMemory.withMaxMessages(20);
    }

    // @Bean
    // public RetrievalAugmentor contentRetrival(
    //         @org.springframework.beans.factory.annotation.Qualifier("embeddingStore") EmbeddingStore<TextSegment> embeddingStore,
    //         EmbeddingModel embeddingModel) {
    //     ContentRetriever documentRetriever = EmbeddingStoreContentRetriever.builder()
    //             .embeddingStore(embeddingStore)
    //             .embeddingModel(embeddingModel)
    //             .maxResults(3)
    //             .minScore(0.6)
    //             .build();
    //     return DefaultRetrievalAugmentor.builder()
    //             .contentRetriever(documentRetriever)
    //             .build();
    // }
}
