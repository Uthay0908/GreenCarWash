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

public final class BookingEvents {

    private BookingEvents() {}

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class BookingCreatedEvent extends BaseEvent {
        private String bookingId;
        private String bookingNumber;
        private String customerId;
        private String customerEmail;
        private String customerName;
        private String vehicleId;
        private String packageId;
        private String packageName;
        private List<String> addOnIds;
        private BigDecimal totalAmount;
        private BigDecimal allocatedWaterLitres;
        private String serviceAddress;
        private String bookingMode; // WASH_NOW, SCHEDULE_LATER, RECURRING
        private Instant scheduledTime;
        private String status;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class BookingScheduledEvent extends BaseEvent {
        private String bookingId;
        private String customerId;
        private String customerEmail;
        private Instant scheduledTime;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class BookingCancelledEvent extends BaseEvent {
        private String bookingId;
        private String customerId;
        private String customerEmail;
        private String reason;
        private BigDecimal refundAmount;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class ServiceStartedEvent extends BaseEvent {
        private String bookingId;
        private String washerId;
        private String customerId;
        private Instant startedAt;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class ServiceCompletedEvent extends BaseEvent {
        private String bookingId;
        private String washerId;
        private String customerId;
        private String customerEmail;
        private Instant completedAt;
        private BigDecimal actualWaterUsedLitres;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class CustomerSatisfiedEvent extends BaseEvent {
        private String bookingId;
        private String customerId;
        private String washerId;
        private boolean satisfied;
        private String feedback;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class ChecklistUpdatedEvent extends BaseEvent {
        private String bookingId;
        private String taskId;
        private String taskName;
        private boolean completed;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class AdditionalAddonRequestedEvent extends BaseEvent {
        private String requestId;
        private String bookingId;
        private String washerId;
        private String addOnId;
        private String addOnName;
        private BigDecimal price;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class AdditionalAddonApprovedEvent extends BaseEvent {
        private String requestId;
        private String bookingId;
        private String customerId;
        private String customerEmail;
        private String addOnId;
        private String addOnName;
        private BigDecimal price;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class AdditionalAddonRejectedEvent extends BaseEvent {
        private String requestId;
        private String bookingId;
        private String reason;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class AdditionalPaymentRequiredEvent extends BaseEvent {
        private String bookingId;
        private String customerId;
        private String customerEmail;
        private BigDecimal amount;
        private String description;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class AdditionalPaymentCompletedEvent extends BaseEvent {
        private String bookingId;
        private String customerId;
        private BigDecimal amount;
        private String paymentId;
    }
}
