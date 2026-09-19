package com.greencarwash.catalog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WashPackageResponse {

    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private int durationMinutes;
    private BigDecimal waterAllocationLitres;
    private List<PackageTaskDto> tasks;
    private List<String> servicesCovered;
    private List<String> materials;
    private boolean active;
    private Instant createdAt;
}
