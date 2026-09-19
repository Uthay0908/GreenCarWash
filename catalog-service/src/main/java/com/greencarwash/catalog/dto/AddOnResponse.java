package com.greencarwash.catalog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddOnResponse {

    private String id;
    private String name;
    private String description;
    private BigDecimal fixedPrice;
    private BigDecimal waterAllocationLitres;
    private List<AddOnTaskDto> tasks;
    private boolean active;
    private Instant createdAt;
}
