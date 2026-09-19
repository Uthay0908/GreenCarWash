package com.greencarwash.booking.repository;

import com.greencarwash.booking.entity.Booking;
import com.greencarwash.booking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    Optional<Booking> findByBookingNumber(String bookingNumber);
    List<Booking> findByCustomerIdOrderByCreatedAtDesc(String customerId);
    List<Booking> findByWasherIdOrderByCreatedAtDesc(String washerId);
    List<Booking> findByStatus(BookingStatus status);
}
