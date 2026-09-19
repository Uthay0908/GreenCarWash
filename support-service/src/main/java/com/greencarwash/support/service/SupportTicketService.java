package com.greencarwash.support.service;

import com.greencarwash.support.dto.*;
import com.greencarwash.support.entity.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SupportTicketService {
    TicketResponse createTicket(Long userId, String userRole, CreateTicketRequest request);
    TicketResponse getTicket(Long ticketId, Long userId, String userRole);
    List<TicketResponse> getMyTickets(Long userId);
    TicketMessageDto addMessage(Long ticketId, Long senderId, String senderRole, TicketMessageDto messageDto);
    TicketResponse updateStatus(Long ticketId, UpdateTicketStatusRequest request);
    Page<TicketResponse> getAllTickets(TicketStatus status, Pageable pageable);
}
