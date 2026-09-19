package com.greencarwash.support.dto;

import com.greencarwash.support.entity.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTicketStatusRequest {
    @NotNull
    private TicketStatus status;
    private String resolutionNotes;
    private Long assignedAgentId;
}
