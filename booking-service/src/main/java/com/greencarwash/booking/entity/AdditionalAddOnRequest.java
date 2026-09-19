package com.greencarwash.booking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "additional_addon_requests", indexes = {
        @Index(name = "idx_addreq_booking", columnList = "booking_id"),
        @Index(name = "idx_addreq_status", columnList = "status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdditionalAddOnRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnore
    private Booking booking;

    @Column(nullable = false)
    private String washerId;

    @Column(nullable = false)
    private String addOnId;

    @Column(nullable = false, length = 100)
    private String addOnName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(precision = 10, scale = 2)
    private BigDecimal waterAllocationLitres;

    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, PAYMENT_PENDING, PAID

    private String adminReviewNotes;
    private String rejectionReason;

    private String paymentTransactionId;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
