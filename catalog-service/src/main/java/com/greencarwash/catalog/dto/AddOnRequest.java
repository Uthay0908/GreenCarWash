package com.greencarwash.catalog.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddOnRequest {

    @NotBlank(message = "Add-on name is required")
    private String name;

    private String description;

    @NotNull(message = "Fixed price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Fixed price must be greater than zero")
    private BigDecimal fixedPrice;

    private BigDecimal waterAllocationLitres;

    private List<AddOnTaskDto> tasks;

    private Boolean active;
}
