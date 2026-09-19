package com.greencarwash.watermonitor.dto;

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
public class WaterSavingsSummaryResponse {
    private String customerId;
    private String customerName;
    private BigDecimal totalLitresSaved;
    private BigDecimal totalGallonsSaved;
    private long totalWashes;
    private List<WaterRecordResponse> recentRecords;
}
