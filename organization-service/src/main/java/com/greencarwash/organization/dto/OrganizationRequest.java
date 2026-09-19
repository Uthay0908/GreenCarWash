package com.greencarwash.organization.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationRequest {
    @NotBlank
    private String name;
    private String taxId;
    @NotBlank
    @Email
    private String contactEmail;
    private String contactPhone;
    private String billingAddress;
    private String billingPlan;
    private String contractTier;
}
