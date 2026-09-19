package com.greencarwash.organization.service;

import com.greencarwash.organization.dto.*;

import java.util.List;

public interface CorporateService {
    OrganizationResponse registerOrganization(OrganizationRequest request);
    OrganizationResponse getOrganizationById(Long id);
    CorporateFacilityDto addFacility(CorporateFacilityDto dto);
    CorporateFleetVehicleDto addFleetVehicle(CorporateFleetVehicleDto dto);
    List<CorporateFleetVehicleDto> getFleetVehicles(Long organizationId);
    CorporateRecurringScheduleDto createRecurringSchedule(CorporateRecurringScheduleDto dto);
    List<CorporateRecurringScheduleDto> getRecurringSchedules(Long organizationId);
    CorporateDashboardResponse getDashboard(Long organizationId);
}
