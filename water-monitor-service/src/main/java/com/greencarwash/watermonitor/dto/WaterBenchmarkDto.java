package com.greencarwash.watermonitor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WaterBenchmarkDto {
    private String id;

    @NotBlank(message = "Vehicle size is required")
    private String vehicleSize;

    @NotNull(message = "Traditional baseline is required")
    private BigDecimal traditionalBaselineLitres;

    private BigDecimal lowWaterBaselineLitres;
    private BigDecimal steamBaselineLitres;
    private BigDecimal waterlessBaselineLitres;
    private BigDecimal ecoPressureBaselineLitres;
}
