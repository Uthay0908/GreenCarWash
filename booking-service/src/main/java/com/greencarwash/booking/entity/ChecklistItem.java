package com.greencarwash.booking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "booking_checklist_items", indexes = {
        @Index(name = "idx_checklist_booking", columnList = "booking_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnore
    private Booking booking;

    @Column(nullable = false)
    private String taskId;

    @Column(nullable = false, length = 100)
    private String taskName;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private int sequenceOrder;

    @Builder.Default
    private boolean mandatory = true;

    @Builder.Default
    private boolean completed = false;

    private Instant completedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ChecklistSource source = ChecklistSource.PACKAGE;
}
