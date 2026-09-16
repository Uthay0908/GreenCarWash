package com.greencarwash.booking.repository;

import com.greencarwash.booking.entity.BookingRecord;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRecordRepository extends JpaRepository<BookingRecord, Long> {
}
