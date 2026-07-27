package com.rag.simple_rag.tool;

import dev.langchain4j.agent.tool.Tool;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.data.embedding.Embedding;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Slf4j
@Component("retrieveTool")
public class RetrieveTool {

    private final EmbeddingStore<TextSegment> embeddingStore;
    private final EmbeddingModel embeddingModel;

    public RetrieveTool(
            @org.springframework.beans.factory.annotation.Qualifier("embeddingStore") EmbeddingStore<TextSegment> embeddingStore,
            EmbeddingModel embeddingModel) {
        this.embeddingStore = embeddingStore;
        this.embeddingModel = embeddingModel;
    }

    @Tool("Searches the vector database for the most relevant text segments for the given user query.")
    public String searchTool(String query) {
        log.info("Tool called: searchTool, query={}", query);
        Embedding queryEmbedding = embeddingModel.embed(query).content();
        EmbeddingSearchResult<TextSegment> searchResult = embeddingStore.search(
                EmbeddingSearchRequest.builder()
                        .queryEmbedding(queryEmbedding)
                        .maxResults(3)
                        .minScore(0.6).build()
        );
        return searchResult.matches().stream()
                .map(this::formatMatch)
                .collect(Collectors.joining("\n"));
    }

    private String formatMatch(EmbeddingMatch<TextSegment> match) {
        return "score=" + match.score() + ", text=" + match.embedded().text();
    }
}
