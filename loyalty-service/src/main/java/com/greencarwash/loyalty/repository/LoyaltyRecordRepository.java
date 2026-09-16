package com.greencarwash.loyalty.repository;

import com.greencarwash.loyalty.entity.LoyaltyRecord;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LoyaltyRecordRepository extends JpaRepository<LoyaltyRecord, Long> {
}
