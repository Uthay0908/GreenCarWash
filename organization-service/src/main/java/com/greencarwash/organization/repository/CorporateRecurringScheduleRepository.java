package com.greencarwash.organization.repository;

import com.greencarwash.organization.entity.CorporateRecurringSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CorporateRecurringScheduleRepository extends JpaRepository<CorporateRecurringSchedule, Long> {
    List<CorporateRecurringSchedule> findByOrganizationIdAndIsActiveTrue(Long organizationId);
}
