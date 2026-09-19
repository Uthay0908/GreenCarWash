package com.greencarwash.booking.repository;

import com.greencarwash.booking.entity.AdditionalAddOnRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdditionalAddOnRequestRepository extends JpaRepository<AdditionalAddOnRequest, String> {
    List<AdditionalAddOnRequest> findByBookingId(String bookingId);
    List<AdditionalAddOnRequest> findByStatus(String status);
}
