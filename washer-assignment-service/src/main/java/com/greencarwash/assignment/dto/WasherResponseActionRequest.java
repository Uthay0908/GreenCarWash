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
public class WasherResponseActionRequest {

    @NotBlank(message = "Action is required (ACCEPT or REJECT)")
    private String action; // ACCEPT, REJECT

    private String rejectionReason;
}
