package com.greencarwash.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "booking_outbox_events", indexes = {
        @Index(name = "idx_outbox_status", columnList = "status"),
        @Index(name = "idx_outbox_created", columnList = "createdAt")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutboxEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 50)
    private String aggregateType; // e.g. BOOKING

    @Column(nullable = false)
    private String aggregateId;

    @Column(nullable = false, length = 100)
    private String eventType;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String payload;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, PUBLISHED, FAILED

    private String exchange;
    private String routingKey;
    private String correlationId;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant processedAt;
}
