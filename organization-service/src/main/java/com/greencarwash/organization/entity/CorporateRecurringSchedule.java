package com.greencarwash.organization.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "corporate_recurring_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CorporateRecurringSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long organizationId;

    private Long facilityId;

    @Column(nullable = false)
    private String dayOfWeek;

    @Column(nullable = false)
    private String preferredTimeSlot;

    @Column(nullable = false)
    private String packageId;

    @Column(nullable = false)
    private String facilityAddress;

    @Column(nullable = false)
    @Builder.Default
    private Integer estimatedVehicleCount = 5;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
