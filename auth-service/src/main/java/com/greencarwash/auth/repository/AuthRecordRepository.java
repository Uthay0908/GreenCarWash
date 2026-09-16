package com.greencarwash.auth.repository;

import com.greencarwash.auth.entity.AuthRecord;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthRecordRepository extends JpaRepository<AuthRecord, Long> {
}
