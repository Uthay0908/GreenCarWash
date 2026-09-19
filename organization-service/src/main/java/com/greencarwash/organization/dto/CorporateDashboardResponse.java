package com.greencarwash.organization.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorporateDashboardResponse {
    private Long organizationId;
    private String organizationName;
    private String contactEmail;
    private String contractTier;
    private Double discountRate;
    private Integer totalFleetVehicles;
    private Integer activeSchedulesCount;
    private Double totalWaterGallonsSaved;
    private Double totalTreesEquivalent;
    private Double totalCo2KgOffset;
    private List<CorporateFleetVehicleDto> fleetVehicles;
    private List<CorporateRecurringScheduleDto> activeSchedules;
}
