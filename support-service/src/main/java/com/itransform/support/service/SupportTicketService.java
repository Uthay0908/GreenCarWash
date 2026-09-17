package com.itransform.support.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.itransform.support.dto.SupportTicketRequest;
import com.itransform.support.dto.SupportTicketResponse;
import com.itransform.support.entity.SupportTicket;
import com.itransform.support.exception.ResourceNotFoundException;
import com.itransform.support.repository.SupportTicketRepository;

@Service
public class SupportTicketService {

    private final SupportTicketRepository repository;

    public SupportTicketService(
            SupportTicketRepository repository) {

        this.repository = repository;
    }

    public SupportTicketResponse createTicket(
            SupportTicketRequest request) {

        SupportTicket ticket = new SupportTicket();

        ticket.setCustomerId(request.getCustomerId());
        ticket.setBookingId(request.getBookingId());
        ticket.setSubject(request.getSubject());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setStatus("OPEN");

        SupportTicket savedTicket = repository.save(ticket);

        return convertToResponse(savedTicket);
    }

    public List<SupportTicketResponse> getAllTickets() {

        return repository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public SupportTicketResponse getTicketById(Long id) {

        SupportTicket ticket = repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Support ticket not found with id: " + id));

        return convertToResponse(ticket);
    }

    public List<SupportTicketResponse> getTicketsByCustomer(
            Long customerId) {

        return repository.findByCustomerId(customerId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public List<SupportTicketResponse> getTicketsByStatus(
            String status) {

        return repository.findByStatus(status)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public SupportTicketResponse assignTicket(
            Long id,
            String assignedTo) {

        SupportTicket ticket = getEntity(id);

        ticket.setAssignedTo(assignedTo);

        if ("OPEN".equals(ticket.getStatus())) {
            ticket.setStatus("IN_PROGRESS");
        }

        return convertToResponse(repository.save(ticket));
    }

    public SupportTicketResponse resolveTicket(
            Long id,
            String resolution) {

        SupportTicket ticket = getEntity(id);

        ticket.setResolution(resolution);
        ticket.setStatus("RESOLVED");

        return convertToResponse(repository.save(ticket));
    }

    public SupportTicketResponse closeTicket(Long id) {

        SupportTicket ticket = getEntity(id);

        ticket.setStatus("CLOSED");

        return convertToResponse(repository.save(ticket));
    }

    public void deleteTicket(Long id) {

        SupportTicket ticket = getEntity(id);

        repository.delete(ticket);
    }

    private SupportTicket getEntity(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Support ticket not found with id: " + id));
    }

    private SupportTicketResponse convertToResponse(
            SupportTicket ticket) {

        return new SupportTicketResponse(
                ticket.getId(),
                ticket.getCustomerId(),
                ticket.getBookingId(),
                ticket.getSubject(),
                ticket.getDescription(),
                ticket.getCategory(),
                ticket.getPriority(),
                ticket.getStatus(),
                ticket.getAssignedTo(),
                ticket.getResolution(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }
}