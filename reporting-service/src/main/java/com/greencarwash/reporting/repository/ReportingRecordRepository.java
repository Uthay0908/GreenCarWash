package com.greencarwash.reporting.repository;

import com.greencarwash.reporting.entity.ReportingRecord;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportingRecordRepository extends JpaRepository<ReportingRecord, Long> {
}
