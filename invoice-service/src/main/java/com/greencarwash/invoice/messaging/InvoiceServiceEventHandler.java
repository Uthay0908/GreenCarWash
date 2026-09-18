package com.greencarwash.invoice.messaging;

import com.greencarwash.invoice.config.RabbitConfig;

import com.greencarwash.invoice.event.DomainEvent;

import org.springframework.amqp.rabbit.annotation.RabbitListener;

import org.springframework.stereotype.Component;
@Component public class InvoiceServiceEventHandler { @RabbitListener(queues="greencarwash.invoice-service.events") public void handle(DomainEvent event) { System.out.println("Processed event " + event.eventType() + " in invoice-service"); } }
