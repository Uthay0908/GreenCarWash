package com.greencarwash.invoice.event;

import java.time.Instant;

import java.util.UUID;

public record DomainEvent(String eventId, String eventType, Instant timestamp, String aggregateId, String actorRole, String correlationId, String payload) {
    public static DomainEvent of(String type, String aggregateId, String payload) { return new DomainEvent(UUID.randomUUID().toString(), type, Instant.now(), aggregateId, "SYSTEM", UUID.randomUUID().toString(), payload); }
}
