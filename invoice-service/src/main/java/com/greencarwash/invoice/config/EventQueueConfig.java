package com.greencarwash.invoice.config;

import org.springframework.amqp.core.Queue;

import org.springframework.context.annotation.Bean;

import org.springframework.context.annotation.Configuration;
@Configuration public class EventQueueConfig { @Bean Queue serviceEventsQueue(){return new Queue("greencarwash.invoice-service.events",true);} }
