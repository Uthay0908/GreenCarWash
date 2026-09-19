package com.greencarwash.organization.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "organizations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String taxId;

    @Column(nullable = false)
    private String contactEmail;

    private String contactPhone;

    private String billingAddress;

    @Builder.Default
    private String billingPlan = "STANDARD_FLEET";

    @Builder.Default
    private String contractTier = "SILVER_FLEET";

    @Builder.Default
    private Double discountRate = 0.15;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
