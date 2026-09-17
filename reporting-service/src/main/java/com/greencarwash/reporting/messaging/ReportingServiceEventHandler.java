package com.greencarwash.reporting.messaging;

import com.greencarwash.reporting.config.RabbitConfig;

import com.greencarwash.reporting.event.DomainEvent;

import org.springframework.amqp.rabbit.annotation.RabbitListener;

import org.springframework.stereotype.Component;
@Component public class ReportingServiceEventHandler { @RabbitListener(queues="greencarwash.reporting-service.events") public void handle(DomainEvent event) { System.out.println("Processed event " + event.eventType() + " in reporting-service"); } }
