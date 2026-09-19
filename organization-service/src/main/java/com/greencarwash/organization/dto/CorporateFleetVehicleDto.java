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
public class CorporateFleetVehicleDto {
    private Long id;
    private Long organizationId;
    @NotBlank
    private String vehicleIdentifier;
    @NotBlank
    private String make;
    @NotBlank
    private String model;
    @NotNull
    private Integer year;
    private String color;
    @NotBlank
    private String licensePlate;
    private String parkingSlot;
}
