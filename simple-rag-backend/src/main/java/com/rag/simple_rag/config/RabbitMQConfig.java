package com.rag.simple_rag.config;

import org.springframework.amqp.core.Queue;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${cloudamqp.queue.name}")
    private String queueName;

    @Bean
    public Queue documentProcessingQueue() {
        return new Queue(queueName, true); // durable = true
    }
}
