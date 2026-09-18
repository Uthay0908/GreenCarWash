package com.greencarwash.vehicle.repository;

import com.greencarwash.vehicle.entity.VehicleRecord;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleRecordRepository extends JpaRepository<VehicleRecord, Long> {
}
