package com.greencarwash.notification.repository;

import com.greencarwash.notification.entity.NotificationRecord;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRecordRepository extends JpaRepository<NotificationRecord, Long> {
}
