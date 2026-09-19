package com.greencarwash.organization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorporateRecurringScheduleDto {
    private Long id;
    @NotNull
    private Long organizationId;
    private Long facilityId;
    @NotBlank
    private String dayOfWeek;
    @NotBlank
    private String preferredTimeSlot;
    @NotBlank
    private String packageId;
    @NotBlank
    private String facilityAddress;
    private Integer estimatedVehicleCount;
    private Boolean isActive;
}
