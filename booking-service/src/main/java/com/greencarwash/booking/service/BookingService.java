package com.greencarwash.booking.service;

import com.greencarwash.booking.dto.BookingCreateRequest;
import com.greencarwash.booking.dto.BookingResponse;
import com.greencarwash.booking.dto.ChecklistItemDto;
import com.greencarwash.booking.dto.StatusUpdateRequest;
import com.greencarwash.booking.entity.*;
import com.greencarwash.booking.repository.BookingRepository;
import com.greencarwash.booking.repository.BookingStatusHistoryRepository;
import com.greencarwash.booking.repository.ChecklistItemRepository;
import com.greencarwash.common.core.exception.BusinessException;
import com.greencarwash.common.core.exception.ResourceNotFoundException;
import com.greencarwash.common.core.util.CorrelationContext;
import com.greencarwash.common.events.RabbitMQConstants;
import com.greencarwash.common.events.model.BookingEvents;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final BookingStatusHistoryRepository statusHistoryRepository;
    private final OutboxPublisherService outboxPublisherService;

    @Transactional
    public BookingResponse createBooking(String customerId, String customerEmail, String customerName, BookingCreateRequest request) {
        String bookingNumber = generateBookingNumber();

        Booking booking = Booking.builder()
                .bookingNumber(bookingNumber)
                .customerId(customerId)
                .customerEmail(customerEmail)
                .customerName(customerName)
                .vehicleId(request.getVehicleId())
                .packageId(request.getPackageId())
                .packageName(request.getPackageName())
                .serviceAddress(request.getServiceAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .bookingMode(request.getBookingMode())
                .scheduledTime(request.getScheduledTime())
                .status(BookingStatus.CREATED)
                .totalAmount(request.getTotalAmount())
                .allocatedWaterLitres(request.getAllocatedWaterLitres())
                .build();

        // Populate base package dynamic checklist items
        int seq = 1;
        ChecklistItem task1 = ChecklistItem.builder().booking(booking).taskId("T1").taskName("Exterior Pre-Rinse & Foaming").sequenceOrder(seq++).mandatory(true).source(ChecklistSource.PACKAGE).build();
        ChecklistItem task2 = ChecklistItem.builder().booking(booking).taskId("T2").taskName("High-Pressure Wheel & Tyre Wash").sequenceOrder(seq++).mandatory(true).source(ChecklistSource.PACKAGE).build();
        ChecklistItem task3 = ChecklistItem.builder().booking(booking).taskId("T3").taskName("Hand Wash & Microfibre Agitation").sequenceOrder(seq++).mandatory(true).source(ChecklistSource.PACKAGE).build();
        ChecklistItem task4 = ChecklistItem.builder().booking(booking).taskId("T4").taskName("Spot-Free Rinse & Microfibre Dry").sequenceOrder(seq++).mandatory(true).source(ChecklistSource.PACKAGE).build();
        ChecklistItem task5 = ChecklistItem.builder().booking(booking).taskId("T5").taskName("Exterior Window & Mirror Polish").sequenceOrder(seq++).mandatory(false).source(ChecklistSource.PACKAGE).build();

        booking.getChecklist().add(task1);
        booking.getChecklist().add(task2);
        booking.getChecklist().add(task3);
        booking.getChecklist().add(task4);
        booking.getChecklist().add(task5);

        // Record Initial Status History
        BookingStatusHistory history = BookingStatusHistory.builder()
                .booking(booking)
                .status(BookingStatus.CREATED)
                .changedBy(customerId)
                .changeReason("Booking initiated by customer")
                .timestamp(Instant.now())
                .build();
        booking.getStatusHistory().add(history);

        booking = bookingRepository.save(booking);

        // Transactional Outbox Event
        BookingEvents.BookingCreatedEvent event = BookingEvents.BookingCreatedEvent.builder()
                .bookingId(booking.getId())
                .bookingNumber(booking.getBookingNumber())
                .customerId(booking.getCustomerId())
                .customerEmail(booking.getCustomerEmail())
                .customerName(booking.getCustomerName())
                .vehicleId(booking.getVehicleId())
                .packageId(booking.getPackageId())
                .packageName(booking.getPackageName())
                .addOnIds(request.getAddOnIds())
                .totalAmount(booking.getTotalAmount())
                .allocatedWaterLitres(booking.getAllocatedWaterLitres())
                .serviceAddress(booking.getServiceAddress())
                .bookingMode(booking.getBookingMode().name())
                .scheduledTime(booking.getScheduledTime())
                .status(booking.getStatus().name())
                .correlationId(CorrelationContext.getCorrelationId())
                .build();

        outboxPublisherService.saveEvent(
                "BOOKING",
                booking.getId(),
                "BookingCreatedEvent",
                RabbitMQConstants.BOOKING_EXCHANGE,
                RabbitMQConstants.RK_BOOKING_CREATED,
                CorrelationContext.getCorrelationId(),
                event
        );

        log.info("Created booking: id={}, number={}", booking.getId(), booking.getBookingNumber());
        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse updateStatus(String bookingId, String actorId, StatusUpdateRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        BookingStatus newStatus = request.getNewStatus();

        // Enforce checklist validation before completion
        if (newStatus == BookingStatus.SERVICE_COMPLETED) {
            boolean mandatoryTasksPending = booking.getChecklist().stream()
                    .filter(ChecklistItem::isMandatory)
                    .anyMatch(task -> !task.isCompleted());
            if (mandatoryTasksPending) {
                throw new BusinessException("Cannot complete service: Mandatory checklist tasks are incomplete.");
            }
            if (request.getActualWaterUsedLitres() != null) {
                booking.setActualWaterUsedLitres(request.getActualWaterUsedLitres());
            }
            if (request.getWashMethod() != null) {
                booking.setWashMethod(request.getWashMethod());
            }
        }

        if (request.getWasherId() != null) {
            booking.setWasherId(request.getWasherId());
        }
        if (request.getWasherName() != null) {
            booking.setWasherName(request.getWasherName());
        }

        booking.setStatus(newStatus);

        BookingStatusHistory history = BookingStatusHistory.builder()
                .booking(booking)
                .status(newStatus)
                .changedBy(actorId)
                .changeReason(request.getReason() != null ? request.getReason() : "Status changed to " + newStatus)
                .timestamp(Instant.now())
                .build();
        booking.getStatusHistory().add(history);

        booking = bookingRepository.save(booking);

        // Publish lifecycle event to outbox
        publishStatusEvent(booking, newStatus);

        log.info("Updated booking {} status to {}", bookingId, newStatus);
        return mapToResponse(booking);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        return mapToResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getCustomerBookings(String customerId) {
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getWasherBookings(String washerId) {
        return bookingRepository.findByWasherIdOrderByCreatedAtDesc(washerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void publishStatusEvent(Booking booking, BookingStatus status) {
        String correlationId = CorrelationContext.getCorrelationId();
        switch (status) {
            case SERVICE_STARTED -> outboxPublisherService.saveEvent(
                    "BOOKING", booking.getId(), "ServiceStartedEvent",
                    RabbitMQConstants.BOOKING_EXCHANGE, RabbitMQConstants.RK_SERVICE_STARTED, correlationId,
                    BookingEvents.ServiceStartedEvent.builder()
                            .bookingId(booking.getId()).washerId(booking.getWasherId()).customerId(booking.getCustomerId()).startedAt(Instant.now()).correlationId(correlationId).build());

            case SERVICE_COMPLETED -> outboxPublisherService.saveEvent(
                    "BOOKING", booking.getId(), "ServiceCompletedEvent",
                    RabbitMQConstants.BOOKING_EXCHANGE, RabbitMQConstants.RK_SERVICE_COMPLETED, correlationId,
                    BookingEvents.ServiceCompletedEvent.builder()
                            .bookingId(booking.getId()).washerId(booking.getWasherId()).customerId(booking.getCustomerId()).customerEmail(booking.getCustomerEmail())
                            .completedAt(Instant.now()).actualWaterUsedLitres(booking.getActualWaterUsedLitres()).correlationId(correlationId).build());

            case CUSTOMER_SATISFIED -> outboxPublisherService.saveEvent(
                    "BOOKING", booking.getId(), "CustomerSatisfiedEvent",
                    RabbitMQConstants.BOOKING_EXCHANGE, RabbitMQConstants.RK_CUSTOMER_SATISFIED, correlationId,
                    BookingEvents.CustomerSatisfiedEvent.builder()
                            .bookingId(booking.getId()).washerId(booking.getWasherId()).customerId(booking.getCustomerId()).satisfied(true).correlationId(correlationId).build());

            case CANCELLED -> outboxPublisherService.saveEvent(
                    "BOOKING", booking.getId(), "BookingCancelledEvent",
                    RabbitMQConstants.BOOKING_EXCHANGE, RabbitMQConstants.RK_BOOKING_CANCELLED, correlationId,
                    BookingEvents.BookingCancelledEvent.builder()
                            .bookingId(booking.getId()).customerId(booking.getCustomerId()).customerEmail(booking.getCustomerEmail()).reason("Cancelled").correlationId(correlationId).build());

            default -> {}
        }
    }

    private String generateBookingNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "GCW-" + datePart + "-" + randomPart;
    }

    private BookingResponse mapToResponse(Booking b) {
        List<ChecklistItemDto> checklistDtos = b.getChecklist().stream()
                .map(c -> ChecklistItemDto.builder()
                        .id(c.getId())
                        .taskId(c.getTaskId())
                        .taskName(c.getTaskName())
                        .description(c.getDescription())
                        .sequenceOrder(c.getSequenceOrder())
                        .mandatory(c.isMandatory())
                        .completed(c.isCompleted())
                        .completedAt(c.getCompletedAt())
                        .source(c.getSource())
                        .build())
                .collect(Collectors.toList());

        return BookingResponse.builder()
                .id(b.getId())
                .bookingNumber(b.getBookingNumber())
                .customerId(b.getCustomerId())
                .customerEmail(b.getCustomerEmail())
                .customerName(b.getCustomerName())
                .vehicleId(b.getVehicleId())
                .packageId(b.getPackageId())
                .packageName(b.getPackageName())
                .serviceAddress(b.getServiceAddress())
                .latitude(b.getLatitude())
                .longitude(b.getLongitude())
                .bookingMode(b.getBookingMode())
                .scheduledTime(b.getScheduledTime())
                .status(b.getStatus())
                .washerId(b.getWasherId())
                .washerName(b.getWasherName())
                .totalAmount(b.getTotalAmount())
                .allocatedWaterLitres(b.getAllocatedWaterLitres())
                .actualWaterUsedLitres(b.getActualWaterUsedLitres())
                .washMethod(b.getWashMethod())
                .checklist(checklistDtos)
                .createdAt(b.getCreatedAt())
                .build();
    }
}
