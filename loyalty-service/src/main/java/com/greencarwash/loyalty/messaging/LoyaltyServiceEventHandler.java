package com.greencarwash.loyalty.messaging;

import com.greencarwash.loyalty.config.RabbitConfig;

import com.greencarwash.loyalty.event.DomainEvent;

import org.springframework.amqp.rabbit.annotation.RabbitListener;

import org.springframework.stereotype.Component;
@Component public class LoyaltyServiceEventHandler { @RabbitListener(queues="greencarwash.loyalty-service.events") public void handle(DomainEvent event) { System.out.println("Processed event " + event.eventType() + " in loyalty-service"); } }
