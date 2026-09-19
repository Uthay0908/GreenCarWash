package com.greencarwash.booking.dto;

import com.greencarwash.booking.entity.BookingMode;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class BookingCreateRequest {

    @NotBlank(message = "Vehicle ID is required")
    private String vehicleId;

    @NotBlank(message = "Package ID is required")
    private String packageId;

    @NotBlank(message = "Package name is required")
    private String packageName;

    @NotBlank(message = "Service address is required")
    private String serviceAddress;

    private Double latitude;
    private Double longitude;

    @NotNull(message = "Booking mode is required")
    private BookingMode bookingMode; // WASH_NOW, SCHEDULE_LATER, RECURRING

    private Instant scheduledTime;

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Total amount must be greater than zero")
    private BigDecimal totalAmount;

    @NotNull(message = "Allocated water is required")
    @DecimalMin(value = "0.0", message = "Allocated water cannot be negative")
    private BigDecimal allocatedWaterLitres;

    private List<String> addOnIds;
    private String promoCode;
}
