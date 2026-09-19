package com.greencarwash.booking.repository;

import com.greencarwash.booking.entity.BookingStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingStatusHistoryRepository extends JpaRepository<BookingStatusHistory, String> {
    List<BookingStatusHistory> findByBookingIdOrderByTimestampAsc(String bookingId);
}
