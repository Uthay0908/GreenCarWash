package com.greencarwash.payment.messaging;

import com.greencarwash.payment.config.RabbitConfig;

import com.greencarwash.payment.event.DomainEvent;

import org.springframework.amqp.rabbit.annotation.RabbitListener;

import org.springframework.stereotype.Component;
@Component public class PaymentServiceEventHandler { @RabbitListener(queues="greencarwash.payment-service.events") public void handle(DomainEvent event) { System.out.println("Processed event " + event.eventType() + " in payment-service"); } }
