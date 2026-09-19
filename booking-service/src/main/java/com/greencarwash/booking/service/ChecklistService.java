package com.greencarwash.booking.service;

import com.greencarwash.booking.dto.ChecklistItemDto;
import com.greencarwash.booking.entity.ChecklistItem;
import com.greencarwash.booking.repository.ChecklistItemRepository;
import com.greencarwash.common.core.exception.ResourceNotFoundException;
import com.greencarwash.common.core.util.CorrelationContext;
import com.greencarwash.common.events.RabbitMQConstants;
import com.greencarwash.common.events.model.BookingEvents;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChecklistService {

    private final ChecklistItemRepository checklistItemRepository;
    private final OutboxPublisherService outboxPublisherService;

    @Transactional(readOnly = true)
    public List<ChecklistItemDto> getChecklist(String bookingId) {
        return checklistItemRepository.findByBookingIdOrderBySequenceOrderAsc(bookingId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChecklistItemDto markTask(String bookingId, String itemId, boolean completed) {
        ChecklistItem item = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist Task", "id", itemId));

        item.setCompleted(completed);
        item.setCompletedAt(completed ? Instant.now() : null);
        item = checklistItemRepository.save(item);

        outboxPublisherService.saveEvent(
                "BOOKING",
                bookingId,
                "ChecklistUpdatedEvent",
                RabbitMQConstants.BOOKING_EXCHANGE,
                RabbitMQConstants.RK_CHECKLIST_UPDATED,
                CorrelationContext.getCorrelationId(),
                BookingEvents.ChecklistUpdatedEvent.builder()
                        .bookingId(bookingId)
                        .taskId(item.getTaskId())
                        .taskName(item.getTaskName())
                        .completed(completed)
                        .correlationId(CorrelationContext.getCorrelationId())
                        .build()
        );

        log.info("Checklist item {} for booking {} marked as completed={}", itemId, bookingId, completed);
        return mapToDto(item);
    }

    private ChecklistItemDto mapToDto(ChecklistItem c) {
        return ChecklistItemDto.builder()
                .id(c.getId())
                .taskId(c.getTaskId())
                .taskName(c.getTaskName())
                .description(c.getDescription())
                .sequenceOrder(c.getSequenceOrder())
                .mandatory(c.isMandatory())
                .completed(c.isCompleted())
                .completedAt(c.getCompletedAt())
                .source(c.getSource())
                .build();
    }
}
