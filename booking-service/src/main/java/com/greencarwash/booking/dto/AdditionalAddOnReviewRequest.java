package com.greencarwash.booking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdditionalAddOnReviewRequest {

    @NotBlank(message = "Review action is required (APPROVE or REJECT)")
    private String action; // APPROVE, REJECT

    private String reviewNotes;
    private String rejectionReason;
}
