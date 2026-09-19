package com.greencarwash.booking.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdditionalAddOnCreateRequest {

    @NotBlank(message = "Add-on ID is required")
    private String addOnId;

    @NotBlank(message = "Add-on name is required")
    private String addOnName;

    @NotNull(message = "Catalog price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    private BigDecimal price;

    private BigDecimal waterAllocationLitres;
}
