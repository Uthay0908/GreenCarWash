package com.greencarwash.booking.dto;

import com.greencarwash.booking.entity.BookingMode;
import com.greencarwash.booking.entity.BookingStatus;
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
public class BookingResponse {

    private String id;
    private String bookingNumber;
    private String customerId;
    private String customerEmail;
    private String customerName;
    private String vehicleId;
    private String packageId;
    private String packageName;
    private String serviceAddress;
    private Double latitude;
    private Double longitude;
    private BookingMode bookingMode;
    private Instant scheduledTime;
    private BookingStatus status;
    private String washerId;
    private String washerName;
    private BigDecimal totalAmount;
    private BigDecimal allocatedWaterLitres;
    private BigDecimal actualWaterUsedLitres;
    private String washMethod;
    private List<ChecklistItemDto> checklist;
    private Instant createdAt;
}
