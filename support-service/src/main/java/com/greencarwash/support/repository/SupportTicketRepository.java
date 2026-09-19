package com.greencarwash.support.repository;

import com.greencarwash.support.entity.SupportTicket;
import com.greencarwash.support.entity.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    Optional<SupportTicket> findByTicketNumber(String ticketNumber);
    List<SupportTicket> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<SupportTicket> findByStatus(TicketStatus status, Pageable pageable);
    long countByStatus(TicketStatus status);
}
