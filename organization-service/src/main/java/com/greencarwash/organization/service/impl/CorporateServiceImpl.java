package com.greencarwash.organization.service.impl;

import com.greencarwash.common.exception.ResourceNotFoundException;
import com.greencarwash.organization.dto.*;
import com.greencarwash.organization.entity.*;
import com.greencarwash.organization.repository.*;
import com.greencarwash.organization.service.CorporateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CorporateServiceImpl implements CorporateService {

    private final OrganizationRepository organizationRepository;
    private final CorporateFacilityRepository facilityRepository;
    private final CorporateFleetVehicleRepository fleetVehicleRepository;
    private final CorporateRecurringScheduleRepository scheduleRepository;

    @Override
    @Transactional
    public OrganizationResponse registerOrganization(OrganizationRequest request) {
        log.info("Registering organization: {}, email: {}", request.getName(), request.getContactEmail());

        double discount = 0.15;
        if ("ENTERPRISE".equalsIgnoreCase(request.getContractTier())) discount = 0.25;
        else if ("GOLD_FLEET".equalsIgnoreCase(request.getContractTier())) discount = 0.20;

        Organization org = Organization.builder()
                .name(request.getName())
                .taxId(request.getTaxId())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .billingAddress(request.getBillingAddress())
                .billingPlan(request.getBillingPlan() != null ? request.getBillingPlan() : "STANDARD_FLEET")
                .contractTier(request.getContractTier() != null ? request.getContractTier() : "SILVER_FLEET")
                .discountRate(discount)
                .isActive(true)
                .build();

        Organization saved = organizationRepository.save(org);
        return toOrgResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public OrganizationResponse getOrganizationById(Long id) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + id));
        return toOrgResponse(org);
    }

    @Override
    @Transactional
    public CorporateFacilityDto addFacility(CorporateFacilityDto dto) {
        CorporateFacility facility = CorporateFacility.builder()
                .organizationId(dto.getOrganizationId())
                .facilityName(dto.getFacilityName())
                .address(dto.getAddress())
                .parkingLotIdentifier(dto.getParkingLotIdentifier())
                .gateAccessCode(dto.getGateAccessCode())
                .isActive(true)
                .build();

        CorporateFacility saved = facilityRepository.save(facility);
        dto.setId(saved.getId());
        return dto;
    }

    @Override
    @Transactional
    public CorporateFleetVehicleDto addFleetVehicle(CorporateFleetVehicleDto dto) {
        CorporateFleetVehicle vehicle = CorporateFleetVehicle.builder()
                .organizationId(dto.getOrganizationId())
                .vehicleIdentifier(dto.getVehicleIdentifier())
                .make(dto.getMake())
                .model(dto.getModel())
                .year(dto.getYear())
                .color(dto.getColor())
                .licensePlate(dto.getLicensePlate())
                .parkingSlot(dto.getParkingSlot())
                .isActive(true)
                .build();

        CorporateFleetVehicle saved = fleetVehicleRepository.save(vehicle);
        dto.setId(saved.getId());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CorporateFleetVehicleDto> getFleetVehicles(Long organizationId) {
        return fleetVehicleRepository.findByOrganizationIdAndIsActiveTrue(organizationId)
                .stream()
                .map(v -> CorporateFleetVehicleDto.builder()
                        .id(v.getId())
                        .organizationId(v.getOrganizationId())
                        .vehicleIdentifier(v.getVehicleIdentifier())
                        .make(v.getMake())
                        .model(v.getModel())
                        .year(v.getYear())
                        .color(v.getColor())
                        .licensePlate(v.getLicensePlate())
                        .parkingSlot(v.getParkingSlot())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CorporateRecurringScheduleDto createRecurringSchedule(CorporateRecurringScheduleDto dto) {
        CorporateRecurringSchedule schedule = CorporateRecurringSchedule.builder()
                .organizationId(dto.getOrganizationId())
                .facilityId(dto.getFacilityId())
                .dayOfWeek(dto.getDayOfWeek())
                .preferredTimeSlot(dto.getPreferredTimeSlot())
                .packageId(dto.getPackageId())
                .facilityAddress(dto.getFacilityAddress())
                .estimatedVehicleCount(dto.getEstimatedVehicleCount() != null ? dto.getEstimatedVehicleCount() : 5)
                .isActive(true)
                .build();

        CorporateRecurringSchedule saved = scheduleRepository.save(schedule);
        dto.setId(saved.getId());
        dto.setIsActive(saved.getIsActive());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CorporateRecurringScheduleDto> getRecurringSchedules(Long organizationId) {
        return scheduleRepository.findByOrganizationIdAndIsActiveTrue(organizationId)
                .stream()
                .map(s -> CorporateRecurringScheduleDto.builder()
                        .id(s.getId())
                        .organizationId(s.getOrganizationId())
                        .facilityId(s.getFacilityId())
                        .dayOfWeek(s.getDayOfWeek())
                        .preferredTimeSlot(s.getPreferredTimeSlot())
                        .packageId(s.getPackageId())
                        .facilityAddress(s.getFacilityAddress())
                        .estimatedVehicleCount(s.getEstimatedVehicleCount())
                        .isActive(s.getIsActive())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CorporateDashboardResponse getDashboard(Long organizationId) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + organizationId));

        List<CorporateFleetVehicleDto> vehicles = getFleetVehicles(organizationId);
        List<CorporateRecurringScheduleDto> schedules = getRecurringSchedules(organizationId);

        double totalSaved = vehicles.size() * 67.5; // ~67.5 gal per fleet wash
        double trees = Math.round((totalSaved / 180.0) * 100.0) / 100.0;
        double co2 = Math.round((totalSaved * 0.0035) * 100.0) / 100.0;

        return CorporateDashboardResponse.builder()
                .organizationId(org.getId())
                .organizationName(org.getName())
                .contactEmail(org.getContactEmail())
                .contractTier(org.getContractTier())
                .discountRate(org.getDiscountRate())
                .totalFleetVehicles(vehicles.size())
                .activeSchedulesCount(schedules.size())
                .totalWaterGallonsSaved(totalSaved)
                .totalTreesEquivalent(trees)
                .totalCo2KgOffset(co2)
                .fleetVehicles(vehicles)
                .activeSchedules(schedules)
                .build();
    }

    private OrganizationResponse toOrgResponse(Organization org) {
        return OrganizationResponse.builder()
                .id(org.getId())
                .name(org.getName())
                .taxId(org.getTaxId())
                .contactEmail(org.getContactEmail())
                .contactPhone(org.getContactPhone())
                .billingAddress(org.getBillingAddress())
                .billingPlan(org.getBillingPlan())
                .contractTier(org.getContractTier())
                .discountRate(org.getDiscountRate())
                .isActive(org.getIsActive())
                .createdAt(org.getCreatedAt())
                .build();
    }
}
