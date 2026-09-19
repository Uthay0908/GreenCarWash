package com.greencarwash.common.events.model;

import com.greencarwash.common.events.BaseEvent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

public final class MediaEvents {

    private MediaEvents() {}

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class PostWashVerificationUploadedEvent extends BaseEvent {
        private String mediaId;
        private String bookingId;
        private String washerId;
        private String mediaType; // SERVICE_BEFORE, SERVICE_AFTER, DAMAGE_EVIDENCE
        private String mediaUrl;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class PostWashVerificationApprovedEvent extends BaseEvent {
        private String bookingId;
        private String washerId;
        private String customerId;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class PostWashVerificationRejectedEvent extends BaseEvent {
        private String bookingId;
        private String washerId;
        private String reason;
    }
}
