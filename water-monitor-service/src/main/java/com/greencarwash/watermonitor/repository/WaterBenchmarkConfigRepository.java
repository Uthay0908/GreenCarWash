package com.greencarwash.watermonitor.repository;

import com.greencarwash.watermonitor.entity.WaterBenchmarkConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WaterBenchmarkConfigRepository extends JpaRepository<WaterBenchmarkConfig, String> {
    Optional<WaterBenchmarkConfig> findByVehicleSizeIgnoreCase(String vehicleSize);
    boolean existsByVehicleSizeIgnoreCase(String vehicleSize);
}
