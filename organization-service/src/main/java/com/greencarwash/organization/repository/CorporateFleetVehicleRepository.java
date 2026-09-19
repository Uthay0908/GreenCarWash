package com.greencarwash.organization.repository;

import com.greencarwash.organization.entity.CorporateFleetVehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CorporateFleetVehicleRepository extends JpaRepository<CorporateFleetVehicle, Long> {
    List<CorporateFleetVehicle> findByOrganizationIdAndIsActiveTrue(Long organizationId);
}
