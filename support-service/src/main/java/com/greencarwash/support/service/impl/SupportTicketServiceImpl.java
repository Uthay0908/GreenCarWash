package com.greencarwash.support.service.impl;

import com.greencarwash.common.exception.ResourceNotFoundException;
import com.greencarwash.common.exception.UnauthorizedException;
import com.greencarwash.support.dto.*;
import com.greencarwash.support.entity.SupportTicket;
import com.greencarwash.support.entity.TicketMessage;
import com.greencarwash.support.entity.TicketPriority;
import com.greencarwash.support.entity.TicketStatus;
import com.greencarwash.support.repository.SupportTicketRepository;
import com.greencarwash.support.repository.TicketMessageRepository;
import com.greencarwash.support.service.SupportTicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupportTicketServiceImpl implements SupportTicketService {

    private final SupportTicketRepository ticketRepository;
    private final TicketMessageRepository messageRepository;

    @Override
    @Transactional
    public TicketResponse createTicket(Long userId, String userRole, CreateTicketRequest request) {
        String ticketNumber = "TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        log.info("Creating support ticket {} for user {} ({})", ticketNumber, userId, userRole);

        SupportTicket ticket = SupportTicket.builder()
                .ticketNumber(ticketNumber)
                .userId(userId)
                .userRole(userRole)
                .bookingId(request.getBookingId())
                .category(request.getCategory())
                .priority(request.getPriority() != null ? request.getPriority() : TicketPriority.MEDIUM)
                .status(TicketStatus.OPEN)
                .subject(request.getSubject())
                .description(request.getDescription())
                .build();

        SupportTicket saved = ticketRepository.save(ticket);
        return toTicketResponse(saved, List.of());
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getTicket(Long ticketId, Long userId, String userRole) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("SupportTicket not found with id: " + ticketId));

        if (!"ROLE_ADMIN".equals(userRole) && !"ADMIN".equals(userRole) && !ticket.getUserId().equals(userId)) {
            throw new UnauthorizedException("Access denied to this ticket");
        }

        List<TicketMessage> messages = messageRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        List<TicketMessageDto> messageDtos = messages.stream().map(this::toMessageDto).collect(Collectors.toList());
        return toTicketResponse(ticket, messageDtos);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getMyTickets(Long userId) {
        return ticketRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(t -> toTicketResponse(t, List.of()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TicketMessageDto addMessage(Long ticketId, Long senderId, String senderRole, TicketMessageDto messageDto) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("SupportTicket not found with id: " + ticketId));

        TicketMessage msg = TicketMessage.builder()
                .ticketId(ticket.getId())
                .senderId(senderId)
                .senderRole(senderRole)
                .message(messageDto.getMessage())
                .attachmentUrls(messageDto.getAttachmentUrls())
                .build();

        TicketMessage saved = messageRepository.save(msg);
        return toMessageDto(saved);
    }

    @Override
    @Transactional
    public TicketResponse updateStatus(Long ticketId, UpdateTicketStatusRequest request) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("SupportTicket not found with id: " + ticketId));

        ticket.setStatus(request.getStatus());
        if (request.getResolutionNotes() != null) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }
        if (request.getAssignedAgentId() != null) {
            ticket.setAssignedAgentId(request.getAssignedAgentId());
        }
        SupportTicket updated = ticketRepository.save(ticket);
        return toTicketResponse(updated, List.of());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TicketResponse> getAllTickets(TicketStatus status, Pageable pageable) {
        if (status != null) {
            return ticketRepository.findByStatus(status, pageable)
                    .map(t -> toTicketResponse(t, List.of()));
        }
        return ticketRepository.findAll(pageable)
                .map(t -> toTicketResponse(t, List.of()));
    }

    private TicketResponse toTicketResponse(SupportTicket t, List<TicketMessageDto> messages) {
        return TicketResponse.builder()
                .id(t.getId())
                .ticketNumber(t.getTicketNumber())
                .userId(t.getUserId())
                .userRole(t.getUserRole())
                .bookingId(t.getBookingId())
                .category(t.getCategory())
                .priority(t.getPriority())
                .status(t.getStatus())
                .subject(t.getSubject())
                .description(t.getDescription())
                .assignedAgentId(t.getAssignedAgentId())
                .resolutionNotes(t.getResolutionNotes())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .messages(messages)
                .build();
    }

    private TicketMessageDto toMessageDto(TicketMessage m) {
        return TicketMessageDto.builder()
                .id(m.getId())
                .ticketId(m.getTicketId())
                .senderId(m.getSenderId())
                .senderRole(m.getSenderRole())
                .message(m.getMessage())
                .attachmentUrls(m.getAttachmentUrls())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
