package com.greencarwash.organization.repository;

import com.greencarwash.organization.entity.CorporateFacility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CorporateFacilityRepository extends JpaRepository<CorporateFacility, Long> {
    List<CorporateFacility> findByOrganizationIdAndIsActiveTrue(Long organizationId);
}
