package com.greencarwash.assignment.service;

import com.greencarwash.assignment.dto.*;
import com.greencarwash.assignment.entity.AssignmentStatus;
import com.greencarwash.assignment.entity.WasherAssignment;
import com.greencarwash.assignment.repository.WasherAssignmentRepository;
import com.greencarwash.common.core.exception.BusinessException;
import com.greencarwash.common.core.exception.ResourceNotFoundException;
import com.greencarwash.common.core.util.CorrelationContext;
import com.greencarwash.common.events.RabbitMQConstants;
import com.greencarwash.common.events.model.AssignmentEvents;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WasherAssignmentService {

    private final WasherAssignmentRepository assignmentRepository;
    private final ProximityService proximityService;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public AssignmentResponse autoAssign(AutoAssignRequest request) {
        List<WasherCandidateResponse> candidates = proximityService.findAndRankCandidates(
                request.getCustomerLatitude(), request.getCustomerLongitude());

        if (candidates.isEmpty()) {
            throw new BusinessException("No washers are currently available in this service area.");
        }

        WasherCandidateResponse bestMatch = candidates.get(0);

        WasherAssignment assignment = WasherAssignment.builder()
                .bookingId(request.getBookingId())
                .washerId(bestMatch.getWasherId())
                .washerName(bestMatch.getName())
                .status(AssignmentStatus.REQUESTED)
                .etaMinutes(bestMatch.getEstimatedEtaMinutes())
                .build();

        assignment = assignmentRepository.save(assignment);

        publishAssignedEvent(assignment);
        log.info("Auto-assigned booking {} to washer {} (ETA: {} min)", request.getBookingId(), bestMatch.getWasherId(), bestMatch.getEstimatedEtaMinutes());
        return mapToResponse(assignment);
    }

    @Transactional
    public AssignmentResponse customAssign(CustomAssignRequest request) {
        WasherAssignment assignment = WasherAssignment.builder()
                .bookingId(request.getBookingId())
                .washerId(request.getWasherId())
                .washerName(request.getWasherName())
                .status(AssignmentStatus.REQUESTED)
                .etaMinutes(request.getEstimatedEtaMinutes() != null ? request.getEstimatedEtaMinutes() : 25)
                .build();

        assignment = assignmentRepository.save(assignment);

        publishAssignedEvent(assignment);
        log.info("Custom-assigned booking {} to customer-selected washer {}", request.getBookingId(), request.getWasherId());
        return mapToResponse(assignment);
    }

    @Transactional
    public AssignmentResponse handleWasherResponse(String assignmentId, WasherResponseActionRequest request) {
        WasherAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Washer Assignment", "id", assignmentId));

        if (assignment.getStatus() != AssignmentStatus.REQUESTED) {
            throw new BusinessException("Assignment is no longer in REQUESTED state.");
        }

        String correlationId = CorrelationContext.getCorrelationId();
        assignment.setRespondedAt(Instant.now());

        if ("ACCEPT".equalsIgnoreCase(request.getAction())) {
            assignment.setStatus(AssignmentStatus.ACCEPTED);
            assignment = assignmentRepository.save(assignment);

            AssignmentEvents.WasherAcceptedEvent event = AssignmentEvents.WasherAcceptedEvent.builder()
                    .assignmentId(assignment.getId())
                    .bookingId(assignment.getBookingId())
                    .washerId(assignment.getWasherId())
                    .acceptedAt(Instant.now())
                    .correlationId(correlationId)
                    .build();

            rabbitTemplate.convertAndSend(RabbitMQConstants.ASSIGNMENT_EXCHANGE, RabbitMQConstants.RK_WASHER_ACCEPTED, event);
            log.info("Washer {} accepted assignment {}", assignment.getWasherId(), assignmentId);
        } else {
            assignment.setStatus(AssignmentStatus.REJECTED);
            assignment.setRejectionReason(request.getRejectionReason() != null ? request.getRejectionReason() : "Washer unavailable");
            assignment = assignmentRepository.save(assignment);

            AssignmentEvents.WasherRejectedEvent event = AssignmentEvents.WasherRejectedEvent.builder()
                    .assignmentId(assignment.getId())
                    .bookingId(assignment.getBookingId())
                    .washerId(assignment.getWasherId())
                    .reason(assignment.getRejectionReason())
                    .correlationId(correlationId)
                    .build();

            rabbitTemplate.convertAndSend(RabbitMQConstants.ASSIGNMENT_EXCHANGE, RabbitMQConstants.RK_WASHER_REJECTED, event);
            log.warn("Washer {} rejected assignment {}. Triggering reassignment workflow.", assignment.getWasherId(), assignmentId);
        }

        return mapToResponse(assignment);
    }

    @Transactional(readOnly = true)
    public AssignmentResponse getAssignment(String id) {
        WasherAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Washer Assignment", "id", id));
        return mapToResponse(assignment);
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAssignmentsByBooking(String bookingId) {
        return assignmentRepository.findByBookingIdOrderByAssignedAtDesc(bookingId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void publishAssignedEvent(WasherAssignment a) {
        String correlationId = CorrelationContext.getCorrelationId();
        AssignmentEvents.WasherAssignedEvent event = AssignmentEvents.WasherAssignedEvent.builder()
                .assignmentId(a.getId())
                .bookingId(a.getBookingId())
                .washerId(a.getWasherId())
                .washerName(a.getWasherName())
                .eta(a.getEtaMinutes() + " minutes")
                .correlationId(correlationId)
                .build();

        rabbitTemplate.convertAndSend(RabbitMQConstants.ASSIGNMENT_EXCHANGE, RabbitMQConstants.RK_WASHER_ASSIGNED, event);
    }

    private AssignmentResponse mapToResponse(WasherAssignment a) {
        return AssignmentResponse.builder()
                .id(a.getId())
                .bookingId(a.getBookingId())
                .washerId(a.getWasherId())
                .washerName(a.getWasherName())
                .status(a.getStatus())
                .etaMinutes(a.getEtaMinutes())
                .rejectionReason(a.getRejectionReason())
                .assignedAt(a.getAssignedAt())
                .respondedAt(a.getRespondedAt())
                .build();
    }
}
