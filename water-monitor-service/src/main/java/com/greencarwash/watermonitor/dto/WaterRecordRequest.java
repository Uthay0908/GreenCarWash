package com.greencarwash.watermonitor.dto;

import com.greencarwash.watermonitor.entity.WashMethod;
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
public class WaterRecordRequest {

    @NotBlank(message = "Booking ID is required")
    private String bookingId;

    @NotBlank(message = "Customer ID is required")
    private String customerId;

    private String customerName;
    private String washerId;
    private WashMethod washMethod;

    @NotNull(message = "Allocated litres is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Allocated litres must be positive")
    private BigDecimal allocatedLitres;

    @NotNull(message = "Actual used litres is required")
    @DecimalMin(value = "0.0", message = "Actual used litres cannot be negative")
    private BigDecimal actualUsedLitres;

    private String notes;
}
