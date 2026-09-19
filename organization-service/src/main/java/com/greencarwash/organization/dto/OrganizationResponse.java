package com.greencarwash.organization.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationResponse {
    private Long id;
    private String name;
    private String taxId;
    private String contactEmail;
    private String contactPhone;
    private String billingAddress;
    private String billingPlan;
    private String contractTier;
    private Double discountRate;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
