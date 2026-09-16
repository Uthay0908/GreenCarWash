package com.greencarwash.assignment.repository;

import com.greencarwash.assignment.entity.AssignmentRecord;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentRecordRepository extends JpaRepository<AssignmentRecord, Long> {
}
