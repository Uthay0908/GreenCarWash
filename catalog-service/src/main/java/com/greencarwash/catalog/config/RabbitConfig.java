package com.greencarwash.catalog.config;

import org.springframework.amqp.core.TopicExchange;

import org.springframework.context.annotation.Bean;

import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {
    public static final String EXCHANGE = "greencarwash.events";
    @Bean
    TopicExchange domainExchange() { return new TopicExchange(EXCHANGE, true, false); }
}
