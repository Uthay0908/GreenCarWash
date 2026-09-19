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
public class LeaderboardEntryResponse {
    private int rank;
    private String customerId;
    private String customerName;
    private BigDecimal totalLitresSaved;
    private BigDecimal totalGallonsSaved;
    private long totalWashes;
}
