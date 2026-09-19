package com.greencarwash.catalog.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "promotions", indexes = {
        @Index(name = "idx_promo_code", columnList = "code", unique = true),
        @Index(name = "idx_promo_active", columnList = "active")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(precision = 5, scale = 2)
    private BigDecimal discountPercentage; // e.g., 10.00 for 10%

    @Column(precision = 10, scale = 2)
    private BigDecimal discountFixedAmount; // e.g., 50.00

    @Column(precision = 10, scale = 2)
    private BigDecimal minOrderAmount;

    @Column(nullable = false)
    private Instant startDate;

    @Column(nullable = false)
    private Instant endDate;

    @Builder.Default
    private boolean active = true;

    @Version
    private Long version;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
