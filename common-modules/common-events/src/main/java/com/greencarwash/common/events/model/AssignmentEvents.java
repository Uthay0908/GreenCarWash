package com.greencarwash.common.events.model;

import com.greencarwash.common.events.BaseEvent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.Instant;

public final class AssignmentEvents {

    private AssignmentEvents() {}

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class WasherAssignedEvent extends BaseEvent {
        private String assignmentId;
        private String bookingId;
        private String washerId;
        private String washerName;
        private String washerPhone;
        private String customerEmail;
        private String eta;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class WasherAcceptedEvent extends BaseEvent {
        private String assignmentId;
        private String bookingId;
        private String washerId;
        private String customerEmail;
        private Instant acceptedAt;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class WasherRejectedEvent extends BaseEvent {
        private String assignmentId;
        private String bookingId;
        private String washerId;
        private String reason;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class WasherReassignedEvent extends BaseEvent {
        private String bookingId;
        private String previousWasherId;
        private String newWasherId;
        private String reason;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class WasherOnTheWayEvent extends BaseEvent {
        private String bookingId;
        private String washerId;
        private String customerEmail;
        private String etaMinutes;
        private double currentLatitude;
        private double currentLongitude;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class WasherArrivedEvent extends BaseEvent {
        private String bookingId;
        private String washerId;
        private String customerEmail;
        private Instant arrivedAt;
    }
}
