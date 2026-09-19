package com.greencarwash.support.entity;

import com.greencarwash.common.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ticket_messages")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketMessage extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long ticketId;

    @Column(nullable = false)
    private Long senderId;

    @Column(nullable = false)
    private String senderRole; // CUSTOMER, WASHER, AGENT, ADMIN

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    private String attachmentUrls;
}
