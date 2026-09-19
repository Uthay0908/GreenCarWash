package com.greencarwash.support.dto;

import com.greencarwash.support.entity.TicketCategory;
import com.greencarwash.support.entity.TicketPriority;
import com.greencarwash.support.entity.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private Long id;
    private String ticketNumber;
    private Long userId;
    private String userRole;
    private Long bookingId;
    private TicketCategory category;
    private TicketPriority priority;
    private TicketStatus status;
    private String subject;
    private String description;
    private Long assignedAgentId;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TicketMessageDto> messages;
}
