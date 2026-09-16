package com.greencarwash.payment.repository;

import com.greencarwash.payment.entity.PaymentRecord;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {
}
