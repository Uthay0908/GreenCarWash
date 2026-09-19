package com.greencarwash.booking.service;

import com.greencarwash.booking.dto.StatusUpdateRequest;
import com.greencarwash.booking.entity.Booking;
import com.greencarwash.booking.entity.BookingStatus;
import com.greencarwash.booking.entity.ChecklistItem;
import com.greencarwash.booking.entity.ChecklistSource;
import com.greencarwash.booking.repository.BookingRepository;
import com.greencarwash.common.core.exception.BusinessException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingChecklistTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private OutboxPublisherService outboxPublisherService;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private BookingService bookingService;

    @Test
    @DisplayName("Completing service fails when mandatory checklist task is incomplete")
    void testServiceCompletionBlockedByIncompleteMandatoryTask() {
        ChecklistItem mandatoryTask = ChecklistItem.builder()
                .taskId("TASK-1")
                .taskName("Exterior Foam Wash")
                .mandatory(true)
                .completed(false) // incomplete!
                .source(ChecklistSource.PACKAGE)
                .build();

        List<ChecklistItem> checklist = new ArrayList<>();
        checklist.add(mandatoryTask);

        Booking booking = Booking.builder()
                .id("BKG-999")
                .status(BookingStatus.SERVICE_STARTED)
                .checklist(checklist)
                .statusHistory(new ArrayList<>())
                .build();

        when(bookingRepository.findById("BKG-999")).thenReturn(Optional.of(booking));

        StatusUpdateRequest request = StatusUpdateRequest.builder()
                .newStatus(BookingStatus.SERVICE_COMPLETED)
                .actualWaterUsedLitres(BigDecimal.valueOf(25.00))
                .build();

        BusinessException ex = assertThrows(BusinessException.class, () ->
                bookingService.updateStatus("BKG-999", "WASHER-1", request)
        );

        assertTrue(ex.getMessage().contains("Mandatory checklist tasks are incomplete"));
    }

    @Test
    @DisplayName("Completing service succeeds when all mandatory tasks are completed")
    void testServiceCompletionAllowedWhenMandatoryTasksCompleted() {
        ChecklistItem mandatoryTask = ChecklistItem.builder()
                .taskId("TASK-1")
                .taskName("Exterior Foam Wash")
                .mandatory(true)
                .completed(true) // completed!
                .source(ChecklistSource.PACKAGE)
                .build();

        ChecklistItem optionalTask = ChecklistItem.builder()
                .taskId("TASK-2")
                .taskName("Air Freshener")
                .mandatory(false)
                .completed(false) // optional incomplete is allowed
                .source(ChecklistSource.ADDON)
                .build();

        List<ChecklistItem> checklist = new ArrayList<>();
        checklist.add(mandatoryTask);
        checklist.add(optionalTask);

        Booking booking = Booking.builder()
                .id("BKG-999")
                .bookingNumber("GCW-20260918-ABCDEF")
                .customerId("CUST-1")
                .customerEmail("customer@example.com")
                .status(BookingStatus.SERVICE_STARTED)
                .checklist(checklist)
                .statusHistory(new ArrayList<>())
                .build();

        when(bookingRepository.findById("BKG-999")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        StatusUpdateRequest request = StatusUpdateRequest.builder()
                .newStatus(BookingStatus.SERVICE_COMPLETED)
                .actualWaterUsedLitres(BigDecimal.valueOf(20.00))
                .build();

        assertDoesNotThrow(() ->
                bookingService.updateStatus("BKG-999", "WASHER-1", request)
        );

        assertEquals(BookingStatus.SERVICE_COMPLETED, booking.getStatus());
    }
}
