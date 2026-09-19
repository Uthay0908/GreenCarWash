package com.greencarwash.common.events.model;

import com.greencarwash.common.events.BaseEvent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

public final class PaymentEvents {

    private PaymentEvents() {}

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class PaymentSucceededEvent extends BaseEvent {
        private String paymentId;
        private String bookingId;
        private String customerId;
        private String customerEmail;
        private BigDecimal amount;
        private String currency;
        private String stripePaymentIntentId;
        private String paymentMethod;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class PaymentFailedEvent extends BaseEvent {
        private String paymentId;
        private String bookingId;
        private String customerId;
        private String customerEmail;
        private BigDecimal amount;
        private String failureReason;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class PayoutPendingEvent extends BaseEvent {
        private String payoutId;
        private String bookingId;
        private String washerId;
        private BigDecimal washerAmount;
        private BigDecimal platformFee;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class PayoutCompletedEvent extends BaseEvent {
        private String payoutId;
        private String bookingId;
        private String washerId;
        private BigDecimal amount;
        private String stripeTransferId;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class PayoutFailedEvent extends BaseEvent {
        private String payoutId;
        private String bookingId;
        private String washerId;
        private BigDecimal amount;
        private String failureReason;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class RefundRequestedEvent extends BaseEvent {
        private String refundId;
        private String paymentId;
        private String bookingId;
        private String customerId;
        private BigDecimal refundAmount;
        private String reason;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public static class RefundCompletedEvent extends BaseEvent {
        private String refundId;
        private String paymentId;
        private String bookingId;
        private String customerId;
        private String customerEmail;
        private BigDecimal refundAmount;
        private String stripeRefundId;
    }
}
