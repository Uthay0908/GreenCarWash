package com.greencarwash.support.controller;

import com.greencarwash.support.dto.*;
import com.greencarwash.support.entity.TicketStatus;
import com.greencarwash.support.service.SupportTicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/support")
@RequiredArgsConstructor
@Tag(name = "Support & Disputes", description = "Customer & Washer Support Management APIs")
public class SupportController {

    private final SupportTicketService supportTicketService;

    @Operation(summary = "Create a support ticket")
    @PostMapping("/tickets")
    public ResponseEntity<TicketResponse> createTicket(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_CUSTOMER") String userRole,
            @Valid @RequestBody CreateTicketRequest request) {
        return new ResponseEntity<>(supportTicketService.createTicket(userId, userRole, request), HttpStatus.CREATED);
    }

    @Operation(summary = "Get all tickets for logged-in user")
    @GetMapping("/tickets/my-tickets")
    public ResponseEntity<List<TicketResponse>> getMyTickets(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(supportTicketService.getMyTickets(userId));
    }

    @Operation(summary = "Get ticket by ID")
    @GetMapping("/tickets/{id}")
    public ResponseEntity<TicketResponse> getTicket(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_CUSTOMER") String userRole) {
        return ResponseEntity.ok(supportTicketService.getTicket(id, userId, userRole));
    }

    @Operation(summary = "Post a message / reply to ticket thread")
    @PostMapping("/tickets/{id}/messages")
    public ResponseEntity<TicketMessageDto> addMessage(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long senderId,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_CUSTOMER") String senderRole,
            @Valid @RequestBody TicketMessageDto messageDto) {
        return new ResponseEntity<>(supportTicketService.addMessage(id, senderId, senderRole, messageDto), HttpStatus.CREATED);
    }

    @Operation(summary = "Update ticket status (Admin / Support Agent)")
    @PatchMapping("/tickets/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusRequest request) {
        return ResponseEntity.ok(supportTicketService.updateStatus(id, request));
    }

    @Operation(summary = "Admin list all tickets with optional status filter")
    @GetMapping("/admin/tickets")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<TicketResponse>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(supportTicketService.getAllTickets(status, pageable));
    }
}
