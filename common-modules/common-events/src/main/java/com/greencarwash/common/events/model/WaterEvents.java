package com.greencarwash.common.events.model;

import com.greencarwash.common.events.BaseEvent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

public final class WaterEvents {

    private WaterEvents() {}

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class WaterUsageRecordedEvent extends BaseEvent {
        private String recordId;
        private String bookingId;
        private String customerId;
        private String washerId;
        private String washMethod;
        private BigDecimal allocatedLitres;
        private BigDecimal actualUsedLitres;
        private BigDecimal savedLitres;
        private BigDecimal savedGallons;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class WaterSavingRecordedEvent extends BaseEvent {
        private String customerId;
        private String customerName;
        private BigDecimal totalLitresSaved;
        private BigDecimal totalGallonsSaved;
        private int totalWashes;
    }
}
