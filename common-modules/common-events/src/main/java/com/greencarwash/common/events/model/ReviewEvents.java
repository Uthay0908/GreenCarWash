package com.greencarwash.common.events.model;

import com.greencarwash.common.events.BaseEvent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

public final class ReviewEvents {

    private ReviewEvents() {}

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class ReviewSubmittedEvent extends BaseEvent {
        private String reviewId;
        private String bookingId;
        private String customerId;
        private String washerId;
        private int rating;
        private String comment;
    }
}
