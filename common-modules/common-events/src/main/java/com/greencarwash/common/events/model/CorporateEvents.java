package com.greencarwash.common.events.model;

import com.greencarwash.common.events.BaseEvent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class CorporateEvents {

    private CorporateEvents() {}

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class CorporateBookingCreatedEvent extends BaseEvent {
        private String corporateBookingId;
        private String organizationId;
        private String organizationName;
        private String parkingLocationId;
        private int vehicleCount;
        private String packageId;
        private BigDecimal totalAmount;
        private BigDecimal corporateDiscountAmount;
        private Instant scheduledDate;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class CorporateRecurringBookingCreatedEvent extends BaseEvent {
        private String scheduleId;
        private String organizationId;
        private String recurrencePattern; // WEEKLY, BIWEEKLY, MONTHLY
        private String dayOfWeek;
        private String scheduledTime;
        private List<String> fleetVehicleIds;
    }
}
