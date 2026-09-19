package com.greencarwash.common.events;

public final class RabbitMQConstants {

    private RabbitMQConstants() {}

    // Exchanges
    public static final String BOOKING_EXCHANGE = "booking.events";
    public static final String PAYMENT_EXCHANGE = "payment.events";
    public static final String ASSIGNMENT_EXCHANGE = "assignment.events";
    public static final String WATER_EXCHANGE = "water.events";
    public static final String SUPPORT_EXCHANGE = "support.events";
    public static final String REVIEW_EXCHANGE = "review.events";
    public static final String ORGANIZATION_EXCHANGE = "organization.events";
    public static final String NOTIFICATION_EXCHANGE = "notification.events";
    public static final String MEDIA_EXCHANGE = "media.events";

    // Routing Keys - Booking
    public static final String RK_BOOKING_CREATED = "booking.created";
    public static final String RK_BOOKING_SCHEDULED = "booking.scheduled";
    public static final String RK_BOOKING_CANCELLED = "booking.cancelled";
    public static final String RK_SERVICE_STARTED = "booking.service.started";
    public static final String RK_SERVICE_COMPLETED = "booking.service.completed";
    public static final String RK_CUSTOMER_SATISFIED = "booking.customer.satisfied";
    public static final String RK_CHECKLIST_UPDATED = "booking.checklist.updated";
    public static final String RK_ADDON_REQUESTED = "booking.addon.requested";
    public static final String RK_ADDON_APPROVED = "booking.addon.approved";
    public static final String RK_ADDON_REJECTED = "booking.addon.rejected";
    public static final String RK_ADDON_PAYMENT_REQUIRED = "booking.addon.payment.required";
    public static final String RK_ADDON_PAYMENT_COMPLETED = "booking.addon.payment.completed";

    // Routing Keys - Assignment
    public static final String RK_WASHER_ASSIGNED = "assignment.washer.assigned";
    public static final String RK_WASHER_ACCEPTED = "assignment.washer.accepted";
    public static final String RK_WASHER_REJECTED = "assignment.washer.rejected";
    public static final String RK_WASHER_REASSIGNED = "assignment.washer.reassigned";
    public static final String RK_WASHER_ON_THE_WAY = "assignment.washer.ontheway";
    public static final String RK_WASHER_ARRIVED = "assignment.washer.arrived";

    // Routing Keys - Payment
    public static final String RK_PAYMENT_SUCCEEDED = "payment.succeeded";
    public static final String RK_PAYMENT_FAILED = "payment.failed";
    public static final String RK_PAYOUT_PENDING = "payment.payout.pending";
    public static final String RK_PAYOUT_COMPLETED = "payment.payout.completed";
    public static final String RK_PAYOUT_FAILED = "payment.payout.failed";
    public static final String RK_REFUND_REQUESTED = "payment.refund.requested";
    public static final String RK_REFUND_COMPLETED = "payment.refund.completed";

    // Routing Keys - Water
    public static final String RK_WATER_USAGE_RECORDED = "water.usage.recorded";
    public static final String RK_WATER_SAVING_RECORDED = "water.saving.recorded";

    // Routing Keys - Support
    public static final String RK_COMPLAINT_CREATED = "support.complaint.created";
    public static final String RK_COMPLAINT_RESOLVED = "support.complaint.resolved";
    public static final String RK_DAMAGE_CLAIM_CREATED = "support.damage.created";
    public static final String RK_DAMAGE_CLAIM_RESOLVED = "support.damage.resolved";

    // Routing Keys - Review
    public static final String RK_REVIEW_SUBMITTED = "review.submitted";

    // Routing Keys - Media
    public static final String RK_MEDIA_UPLOADED = "media.uploaded";
    public static final String RK_MEDIA_VERIFIED = "media.verified";

    // Routing Keys - Corporate
    public static final String RK_CORPORATE_BOOKING_CREATED = "organization.booking.created";
    public static final String RK_CORPORATE_RECURRING_CREATED = "organization.recurring.created";

    // Queues
    public static final String NOTIFICATION_QUEUE = "notification.events.queue";
    public static final String REPORTING_QUEUE = "reporting.events.queue";
    public static final String WATER_QUEUE = "water.events.queue";
    public static final String REVIEW_QUEUE = "review.events.queue";
    public static final String ASSIGNMENT_QUEUE = "assignment.events.queue";
    public static final String PAYMENT_QUEUE = "payment.events.queue";
}
