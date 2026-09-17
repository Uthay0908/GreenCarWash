package com.itransform.support.dto;

import java.time.LocalDateTime;

public class SupportTicketResponse {

    private Long id;

    private Long customerId;

    private Long bookingId;

    private String subject;

    private String description;

    private String category;

    private String priority;

    private String status;

    private String assignedTo;

    private String resolution;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public SupportTicketResponse(
            Long id,
            Long customerId,
            Long bookingId,
            String subject,
            String description,
            String category,
            String priority,
            String status,
            String assignedTo,
            String resolution,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        this.id = id;
        this.customerId = customerId;
        this.bookingId = bookingId;
        this.subject = subject;
        this.description = description;
        this.category = category;
        this.priority = priority;
        this.status = status;
        this.assignedTo = assignedTo;
        this.resolution = resolution;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public String getSubject() {
        return subject;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public String getPriority() {
        return priority;
    }

    public String getStatus() {
        return status;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public String getResolution() {
        return resolution;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}