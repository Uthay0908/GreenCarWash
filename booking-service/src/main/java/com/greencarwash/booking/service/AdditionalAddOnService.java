package com.greencarwash.booking.service;

import com.greencarwash.booking.dto.AdditionalAddOnCreateRequest;
import com.greencarwash.booking.dto.AdditionalAddOnReviewRequest;
import com.greencarwash.booking.entity.AdditionalAddOnRequest;
import com.greencarwash.booking.entity.Booking;
import com.greencarwash.booking.entity.ChecklistItem;
import com.greencarwash.booking.entity.ChecklistSource;
import com.greencarwash.booking.repository.AdditionalAddOnRequestRepository;
import com.greencarwash.booking.repository.BookingRepository;
import com.greencarwash.common.core.exception.BusinessException;
import com.greencarwash.common.core.exception.ResourceNotFoundException;
import com.greencarwash.common.core.util.CorrelationContext;
import com.greencarwash.common.events.RabbitMQConstants;
import com.greencarwash.common.events.model.BookingEvents;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdditionalAddOnService {

    private final AdditionalAddOnRequestRepository additionalAddOnRequestRepository;
    private final BookingRepository bookingRepository;
    private final OutboxPublisherService outboxPublisherService;

    @Transactional
    public AdditionalAddOnRequest requestAdditionalAddOn(String bookingId, String washerId, AdditionalAddOnCreateRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        AdditionalAddOnRequest addOnRequest = AdditionalAddOnRequest.builder()
                .booking(booking)
                .washerId(washerId)
                .addOnId(request.getAddOnId())
                .addOnName(request.getAddOnName())
                .price(request.getPrice())
                .waterAllocationLitres(request.getWaterAllocationLitres())
                .status("PENDING")
                .build();

        addOnRequest = additionalAddOnRequestRepository.save(addOnRequest);

        // Outbox event for admin notification
        outboxPublisherService.saveEvent(
                "BOOKING",
                bookingId,
                "AdditionalAddonRequestedEvent",
                RabbitMQConstants.BOOKING_EXCHANGE,
                RabbitMQConstants.RK_ADDON_REQUESTED,
                CorrelationContext.getCorrelationId(),
                BookingEvents.AdditionalAddonRequestedEvent.builder()
                        .requestId(addOnRequest.getId())
                        .bookingId(bookingId)
                        .washerId(washerId)
                        .addOnId(addOnRequest.getAddOnId())
                        .addOnName(addOnRequest.getAddOnName())
                        .price(addOnRequest.getPrice())
                        .correlationId(CorrelationContext.getCorrelationId())
                        .build()
        );

        log.info("Washer {} requested additional add-on {} for booking {}", washerId, request.getAddOnName(), bookingId);
        return addOnRequest;
    }

    @Transactional
    public AdditionalAddOnRequest reviewAdditionalAddOn(String requestId, String adminId, AdditionalAddOnReviewRequest reviewRequest) {
        AdditionalAddOnRequest req = additionalAddOnRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Additional Add-on Request", "id", requestId));

        Booking booking = req.getBooking();

        if ("APPROVE".equalsIgnoreCase(reviewRequest.getAction())) {
            req.setStatus("PAYMENT_PENDING");
            req.setAdminReviewNotes(reviewRequest.getReviewNotes());

            outboxPublisherService.saveEvent(
                    "BOOKING",
                    booking.getId(),
                    "AdditionalAddonApprovedEvent",
                    RabbitMQConstants.BOOKING_EXCHANGE,
                    RabbitMQConstants.RK_ADDON_APPROVED,
                    CorrelationContext.getCorrelationId(),
                    BookingEvents.AdditionalAddonApprovedEvent.builder()
                            .requestId(req.getId())
                            .bookingId(booking.getId())
                            .customerId(booking.getCustomerId())
                            .customerEmail(booking.getCustomerEmail())
                            .addOnId(req.getAddOnId())
                            .addOnName(req.getAddOnName())
                            .price(req.getPrice())
                            .correlationId(CorrelationContext.getCorrelationId())
                            .build()
            );
            log.info("Admin {} approved additional add-on request {}. Customer payment required.", adminId, requestId);
        } else {
            req.setStatus("REJECTED");
            req.setRejectionReason(reviewRequest.getRejectionReason());
            req.setAdminReviewNotes(reviewRequest.getReviewNotes());

            outboxPublisherService.saveEvent(
                    "BOOKING",
                    booking.getId(),
                    "AdditionalAddonRejectedEvent",
                    RabbitMQConstants.BOOKING_EXCHANGE,
                    RabbitMQConstants.RK_ADDON_REJECTED,
                    CorrelationContext.getCorrelationId(),
                    BookingEvents.AdditionalAddonRejectedEvent.builder()
                            .requestId(req.getId())
                            .bookingId(booking.getId())
                            .reason(reviewRequest.getRejectionReason())
                            .correlationId(CorrelationContext.getCorrelationId())
                            .build()
            );
            log.info("Admin {} rejected additional add-on request {}.", adminId, requestId);
        }

        return additionalAddOnRequestRepository.save(req);
    }

    @Transactional
    public void recordPaymentSuccess(String requestId, String paymentTransactionId) {
        AdditionalAddOnRequest req = additionalAddOnRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Additional Add-on Request", "id", requestId));

        if (!"PAYMENT_PENDING".equals(req.getStatus())) {
            throw new BusinessException("Cannot complete payment for add-on request in status: " + req.getStatus());
        }

        req.setStatus("PAID");
        req.setPaymentTransactionId(paymentTransactionId);
        additionalAddOnRequestRepository.save(req);

        Booking booking = req.getBooking();
        // Update booking total amount
        booking.setTotalAmount(booking.getTotalAmount().add(req.getPrice()));

        // Add additional add-on task to dynamic checklist
        int nextSeq = booking.getChecklist().size() + 1;
        ChecklistItem additionalTask = ChecklistItem.builder()
                .booking(booking)
                .taskId("ADDON-" + req.getAddOnId())
                .taskName(req.getAddOnName() + " (Service Add-on)")
                .description("Customer authorized additional service: " + req.getAddOnName())
                .sequenceOrder(nextSeq)
                .mandatory(true)
                .completed(false)
                .source(ChecklistSource.ADDITIONAL_ADDON)
                .build();
        booking.getChecklist().add(additionalTask);
        bookingRepository.save(booking);

        outboxPublisherService.saveEvent(
                "BOOKING",
                booking.getId(),
                "AdditionalPaymentCompletedEvent",
                RabbitMQConstants.BOOKING_EXCHANGE,
                RabbitMQConstants.RK_ADDON_PAYMENT_COMPLETED,
                CorrelationContext.getCorrelationId(),
                BookingEvents.AdditionalPaymentCompletedEvent.builder()
                        .bookingId(booking.getId())
                        .customerId(booking.getCustomerId())
                        .amount(req.getPrice())
                        .paymentId(paymentTransactionId)
                        .correlationId(CorrelationContext.getCorrelationId())
                        .build()
        );

        log.info("Payment confirmed for additional add-on {}. Checklist and booking total updated.", requestId);
    }

    @Transactional(readOnly = true)
    public List<AdditionalAddOnRequest> getRequestsByBooking(String bookingId) {
        return additionalAddOnRequestRepository.findByBookingId(bookingId);
    }

    @Transactional(readOnly = true)
    public List<AdditionalAddOnRequest> getPendingRequests() {
        return additionalAddOnRequestRepository.findByStatus("PENDING");
    }
}
