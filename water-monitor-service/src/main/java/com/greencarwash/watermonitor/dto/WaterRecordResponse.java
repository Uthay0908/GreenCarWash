package com.greencarwash.watermonitor.dto;

import com.greencarwash.watermonitor.entity.WashMethod;
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
public class WaterRecordResponse {
    private String id;
    private String bookingId;
    private String customerId;
    private String customerName;
    private String washerId;
    private WashMethod washMethod;
    private BigDecimal allocatedLitres;
    private BigDecimal actualUsedLitres;
    private BigDecimal savedLitres;
    private BigDecimal savedGallons;
    private Instant recordedAt;
    private String notes;
}
