package com.greencarwash.support.dto;

import com.greencarwash.support.entity.TicketCategory;
import com.greencarwash.support.entity.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTicketRequest {
    private Long bookingId;
    @NotNull
    private TicketCategory category;
    private TicketPriority priority;
    @NotBlank
    private String subject;
    @NotBlank
    private String description;
}
