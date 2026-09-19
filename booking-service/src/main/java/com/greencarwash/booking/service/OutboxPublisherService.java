package com.greencarwash.booking.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greencarwash.booking.entity.OutboxEvent;
import com.greencarwash.booking.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OutboxPublisherService {

    private final OutboxEventRepository outboxEventRepository;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    @Scheduled(fixedDelay = 2000)
    @Transactional
    public void publishPendingEvents() {
        List<OutboxEvent> pendingEvents = outboxEventRepository.findTop50ByStatusOrderByCreatedAtAsc("PENDING");
        if (pendingEvents.isEmpty()) {
            return;
        }

        log.debug("Found {} pending outbox events to publish", pendingEvents.size());
        for (OutboxEvent event : pendingEvents) {
            try {
                rabbitTemplate.convertAndSend(event.getExchange(), event.getRoutingKey(), event.getPayload(), message -> {
                    if (event.getCorrelationId() != null) {
                        message.getMessageProperties().setHeader("X-Correlation-Id", event.getCorrelationId());
                    }
                    message.getMessageProperties().setHeader("eventType", event.getEventType());
                    return message;
                });

                event.setStatus("PUBLISHED");
                event.setProcessedAt(Instant.now());
                log.info("Published outbox event [{}] to exchange {} with key {}", event.getEventType(), event.getExchange(), event.getRoutingKey());
            } catch (Exception e) {
                log.error("Failed to publish outbox event {}: {}", event.getId(), e.getMessage());
                event.setStatus("FAILED");
            }
        }
        outboxEventRepository.saveAll(pendingEvents);
    }

    public void saveEvent(String aggregateType, String aggregateId, String eventType, String exchange, String routingKey, String correlationId, Object eventPayload) {
        try {
            String jsonPayload = objectMapper.writeValueAsString(eventPayload);
            OutboxEvent outboxEvent = OutboxEvent.builder()
                    .aggregateType(aggregateType)
                    .aggregateId(aggregateId)
                    .eventType(eventType)
                    .exchange(exchange)
                    .routingKey(routingKey)
                    .correlationId(correlationId)
                    .payload(jsonPayload)
                    .status("PENDING")
                    .build();
            outboxEventRepository.save(outboxEvent);
        } catch (Exception e) {
            log.error("Failed to serialize outbox event: {}", e.getMessage(), e);
        }
    }
}
