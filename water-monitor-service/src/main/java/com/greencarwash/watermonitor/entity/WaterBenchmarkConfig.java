package com.greencarwash.watermonitor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "water_benchmark_configs", indexes = {
        @Index(name = "idx_water_size", columnList = "vehicle_size", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaterBenchmarkConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "vehicle_size", nullable = false, unique = true)
    private String vehicleSize; // SEDAN, SUV, HATCHBACK, TRUCK, VAN

    @Column(name = "traditional_baseline_litres", nullable = false, precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal traditionalBaselineLitres = BigDecimal.valueOf(200.00);

    @Column(name = "low_water_baseline_litres", nullable = false, precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal lowWaterBaselineLitres = BigDecimal.valueOf(40.00);

    @Column(name = "steam_baseline_litres", nullable = false, precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal steamBaselineLitres = BigDecimal.valueOf(15.00);

    @Column(name = "waterless_baseline_litres", nullable = false, precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal waterlessBaselineLitres = BigDecimal.valueOf(2.00);

    @Column(name = "eco_pressure_baseline_litres", nullable = false, precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal ecoPressureBaselineLitres = BigDecimal.valueOf(25.00);

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
