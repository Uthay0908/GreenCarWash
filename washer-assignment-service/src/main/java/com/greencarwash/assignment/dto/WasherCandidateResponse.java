package com.greencarwash.assignment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WasherCandidateResponse {

    private String washerId;
    private String name;
    private double ratingAverage;
    private int completedWashes;
    private String performanceTier; // TOP_RATED, STANDARD, NEW
    private boolean isAvailable;
    private int estimatedEtaMinutes;
    private double distanceKm;
    private String serviceHistorySummary;
}
