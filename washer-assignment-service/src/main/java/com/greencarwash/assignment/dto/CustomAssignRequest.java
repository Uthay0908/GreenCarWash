package com.greencarwash.assignment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomAssignRequest {

    @NotBlank(message = "Booking ID is required")
    private String bookingId;

    @NotBlank(message = "Washer ID is required")
    private String washerId;

    @NotBlank(message = "Washer name is required")
    private String washerName;

    private Integer estimatedEtaMinutes;
}
