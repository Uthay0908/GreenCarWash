package com.greencarwash.watermonitor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GlobalWaterStatsResponse {
    private BigDecimal totalLitresSaved;
    private BigDecimal totalGallonsSaved;
    private long totalWashesCompleted;
    private long equivalentBathtubsSaved; // approx 150L per bathtub
}
