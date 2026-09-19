package com.greencarwash.booking.repository;

import com.greencarwash.booking.entity.ChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, String> {
    List<ChecklistItem> findByBookingIdOrderBySequenceOrderAsc(String bookingId);
}
