package com.greencarwash.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionRequest {

    @NotBlank(message = "Promo code is required")
    private String code;

    @NotBlank(message = "Description is required")
    private String description;

    private BigDecimal discountPercentage;
    private BigDecimal discountFixedAmount;
    private BigDecimal minOrderAmount;

    @NotNull(message = "Start date is required")
    private Instant startDate;

    @NotNull(message = "End date is required")
    private Instant endDate;

    private Boolean active;
}
