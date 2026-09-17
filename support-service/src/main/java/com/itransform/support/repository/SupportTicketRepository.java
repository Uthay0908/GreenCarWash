package com.itransform.support.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.itransform.support.entity.SupportTicket;

public interface SupportTicketRepository
        extends JpaRepository<SupportTicket, Long> {

    List<SupportTicket> findByCustomerId(Long customerId);

    List<SupportTicket> findByStatus(String status);

    List<SupportTicket> findByPriority(String priority);
}