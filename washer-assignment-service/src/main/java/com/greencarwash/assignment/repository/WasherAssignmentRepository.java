package com.greencarwash.assignment.repository;

import com.greencarwash.assignment.entity.AssignmentStatus;
import com.greencarwash.assignment.entity.WasherAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WasherAssignmentRepository extends JpaRepository<WasherAssignment, String> {
    List<WasherAssignment> findByBookingIdOrderByAssignedAtDesc(String bookingId);
    Optional<WasherAssignment> findFirstByBookingIdAndStatus(String bookingId, AssignmentStatus status);
    List<WasherAssignment> findByWasherIdAndStatus(String washerId, AssignmentStatus status);
}
