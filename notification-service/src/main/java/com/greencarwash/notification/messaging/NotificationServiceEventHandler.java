package com.greencarwash.notification.messaging;

import com.greencarwash.notification.config.RabbitConfig;

import com.greencarwash.notification.event.DomainEvent;

import org.springframework.amqp.rabbit.annotation.RabbitListener;

import org.springframework.stereotype.Component;
@Component public class NotificationServiceEventHandler { @RabbitListener(queues="greencarwash.notification-service.events") public void handle(DomainEvent event) { System.out.println("Processed event " + event.eventType() + " in notification-service"); } }
