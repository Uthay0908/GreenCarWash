package com.greencarwash.common.events.model;

import com.greencarwash.common.events.BaseEvent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

public final class SupportEvents {

    private SupportEvents() {}

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class ComplaintCreatedEvent extends BaseEvent {
        private String complaintId;
        private String bookingId;
        private String customerId;
        private String customerEmail;
        private String reason;
        private String description;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class ComplaintResolvedEvent extends BaseEvent {
        private String complaintId;
        private String bookingId;
        private String customerId;
        private String resolutionType; // NO_ACTION, SERVICE_REDO, PARTIAL_REFUND, FULL_REFUND, CREDIT, WARNING
        private BigDecimal refundAmount;
        private String resolutionNotes;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class DamageClaimCreatedEvent extends BaseEvent {
        private String claimId;
        private String bookingId;
        private String customerId;
        private String washerId;
        private String damageType;
        private String description;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class DamageClaimResolvedEvent extends BaseEvent {
        private String claimId;
        private String bookingId;
        private String customerId;
        private String status; // APPROVED, REJECTED, RESOLVED
        private BigDecimal compensationAmount;
        private String resolutionNotes;
    }
}
