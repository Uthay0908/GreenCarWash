package com.greencarwash.review.repository;

import com.greencarwash.review.entity.ReviewRecord;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRecordRepository extends JpaRepository<ReviewRecord, Long> {
}
