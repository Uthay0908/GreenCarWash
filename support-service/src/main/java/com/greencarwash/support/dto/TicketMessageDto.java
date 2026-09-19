package com.greencarwash.support.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketMessageDto {
    private Long id;
    private Long ticketId;
    private Long senderId;
    private String senderRole;
    @NotBlank
    private String message;
    private String attachmentUrls;
    private LocalDateTime createdAt;
}
