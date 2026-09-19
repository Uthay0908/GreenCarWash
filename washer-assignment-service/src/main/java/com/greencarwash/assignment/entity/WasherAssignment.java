package com.greencarwash.assignment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "washer_assignments", indexes = {
        @Index(name = "idx_assign_booking", columnList = "bookingId"),
        @Index(name = "idx_assign_washer", columnList = "washerId"),
        @Index(name = "idx_assign_status", columnList = "status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WasherAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String bookingId;

    @Column(nullable = false)
    private String washerId;

    @Column(nullable = false)
    private String washerName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private AssignmentStatus status = AssignmentStatus.REQUESTED;

    private Integer etaMinutes;

    private String rejectionReason;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant assignedAt;

    private Instant respondedAt;

    @Version
    private Long version;
}
