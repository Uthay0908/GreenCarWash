package com.greencarwash.watermonitor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "water_saving_records", indexes = {
        @Index(name = "idx_water_booking", columnList = "booking_id", unique = true),
        @Index(name = "idx_water_customer", columnList = "customer_id"),
        @Index(name = "idx_water_washer", columnList = "washer_id"),
        @Index(name = "idx_water_recorded_at", columnList = "recorded_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaterSavingRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "booking_id", nullable = false, unique = true)
    private String bookingId;

    @Column(name = "customer_id", nullable = false)
    private String customerId;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "washer_id")
    private String washerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "wash_method", nullable = false)
    @Builder.Default
    private WashMethod washMethod = WashMethod.LOW_WATER_PRESSURE;

    @Column(name = "allocated_litres", nullable = false, precision = 8, scale = 2)
    private BigDecimal allocatedLitres;

    @Column(name = "actual_used_litres", nullable = false, precision = 8, scale = 2)
    private BigDecimal actualUsedLitres;

    @Column(name = "saved_litres", nullable = false, precision = 8, scale = 2)
    private BigDecimal savedLitres;

    @Column(name = "saved_gallons", nullable = false, precision = 8, scale = 2)
    private BigDecimal savedGallons;

    @Column(name = "recorded_at", nullable = false)
    @Builder.Default
    private Instant recordedAt = Instant.now();

    @Column(length = 1000)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
