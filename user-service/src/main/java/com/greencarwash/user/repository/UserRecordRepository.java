package com.greencarwash.user.repository;

import com.greencarwash.user.entity.UserRecord;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRecordRepository extends JpaRepository<UserRecord, Long> {
}
