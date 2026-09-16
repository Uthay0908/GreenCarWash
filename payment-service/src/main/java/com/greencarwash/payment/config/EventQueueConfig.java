package com.greencarwash.payment.config;

import org.springframework.amqp.core.Queue;

import org.springframework.context.annotation.Bean;

import org.springframework.context.annotation.Configuration;
@Configuration public class EventQueueConfig { @Bean Queue serviceEventsQueue(){return new Queue("greencarwash.payment-service.events",true);} }
