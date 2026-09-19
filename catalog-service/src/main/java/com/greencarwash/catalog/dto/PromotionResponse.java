package com.greencarwash.catalog.dto;

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
public class PromotionResponse {

    private String id;
    private String code;
    private String description;
    private BigDecimal discountPercentage;
    private BigDecimal discountFixedAmount;
    private BigDecimal minOrderAmount;
    private Instant startDate;
    private Instant endDate;
    private boolean active;
}
