package com.greencarwash.invoice.repository;

import com.greencarwash.invoice.entity.InvoiceRecord;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRecordRepository extends JpaRepository<InvoiceRecord, Long> {
}
