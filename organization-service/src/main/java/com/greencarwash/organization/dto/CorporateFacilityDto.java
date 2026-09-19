package com.greencarwash.organization.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorporateFacilityDto {
    private Long id;
    private Long organizationId;
    @NotBlank
    private String facilityName;
    @NotBlank
    private String address;
    private String parkingLotIdentifier;
    private String gateAccessCode;
}
