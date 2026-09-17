package com.itransform.support.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.itransform.support.dto.SupportTicketRequest;
import com.itransform.support.dto.SupportTicketResponse;
import com.itransform.support.service.SupportTicketService;

@RestController
@RequestMapping("/api/support/tickets")
public class SupportTicketController {

    private final SupportTicketService service;

    public SupportTicketController(
            SupportTicketService service) {

        this.service = service;
    }

    @PostMapping
    public ResponseEntity<SupportTicketResponse> createTicket(
            @Valid @RequestBody SupportTicketRequest request) {

        return new ResponseEntity<>(
                service.createTicket(request),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<SupportTicketResponse>> getAllTickets() {

        return ResponseEntity.ok(
                service.getAllTickets()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupportTicketResponse> getTicketById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                service.getTicketById(id)
        );
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<SupportTicketResponse>>
    getTicketsByCustomer(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                service.getTicketsByCustomer(customerId)
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<SupportTicketResponse>>
    getTicketsByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                service.getTicketsByStatus(status)
        );
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<SupportTicketResponse> assignTicket(
            @PathVariable Long id,
            @RequestParam String assignedTo) {

        return ResponseEntity.ok(
                service.assignTicket(id, assignedTo)
        );
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<SupportTicketResponse> resolveTicket(
            @PathVariable Long id,
            @RequestParam String resolution) {

        return ResponseEntity.ok(
                service.resolveTicket(id, resolution)
        );
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<SupportTicketResponse> closeTicket(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                service.closeTicket(id)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable Long id) {

        service.deleteTicket(id);

        return ResponseEntity.noContent().build();
    }
}