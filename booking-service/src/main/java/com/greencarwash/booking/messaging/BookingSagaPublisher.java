package com.greencarwash.booking.messaging;

import com.greencarwash.booking.config.RabbitConfig;

import com.greencarwash.booking.event.DomainEvent;

import org.springframework.amqp.rabbit.core.RabbitTemplate;

import org.springframework.stereotype.Component;
@Component public class BookingSagaPublisher { private final RabbitTemplate rabbitTemplate; public BookingSagaPublisher(RabbitTemplate rabbitTemplate){this.rabbitTemplate=rabbitTemplate;} public void publishBookingCreated(String bookingId){DomainEvent event=DomainEvent.of("BookingCreated",bookingId,"{\"bookingId\":\""+bookingId+"\"}");rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE,"booking.created",event);} }
