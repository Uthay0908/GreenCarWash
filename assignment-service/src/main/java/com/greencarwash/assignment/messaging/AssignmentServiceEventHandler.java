package com.greencarwash.assignment.messaging;

import com.greencarwash.assignment.config.RabbitConfig;

import com.greencarwash.assignment.event.DomainEvent;

import org.springframework.amqp.rabbit.annotation.RabbitListener;

import org.springframework.stereotype.Component;
@Component public class AssignmentServiceEventHandler { @RabbitListener(queues="greencarwash.assignment-service.events") public void handle(DomainEvent event) { System.out.println("Processed event " + event.eventType() + " in assignment-service"); } }
