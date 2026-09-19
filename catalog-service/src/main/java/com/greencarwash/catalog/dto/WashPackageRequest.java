package com.greencarwash.catalog.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WashPackageRequest {

    @NotBlank(message = "Package name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    private BigDecimal price;

    @Min(value = 1, message = "Duration must be at least 1 minute")
    private int durationMinutes;

    @NotNull(message = "Water allocation is required")
    @DecimalMin(value = "0.0", message = "Water allocation cannot be negative")
    private BigDecimal waterAllocationLitres;

    private List<PackageTaskDto> tasks;
    private List<String> servicesCovered;
    private List<String> materials;
    private Boolean active;
}
