package com.greencarwash.booking.dto;

import com.greencarwash.booking.entity.BookingStatus;
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
public class StatusUpdateRequest {

    @NotNull(message = "New status is required")
    private BookingStatus newStatus;

    private String reason;
    private String washerId;
    private String washerName;

    // Recorded upon service completion
    private BigDecimal actualWaterUsedLitres;
    private String washMethod;
}
