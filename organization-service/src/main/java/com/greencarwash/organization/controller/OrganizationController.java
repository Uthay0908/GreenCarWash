package com.greencarwash.organization.controller;

import com.greencarwash.organization.dto.*;
import com.greencarwash.organization.service.CorporateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
@Tag(name = "Organization / B2B", description = "Enterprise Corporate Accounts and Fleet Schedules")
public class OrganizationController {

    private final CorporateService corporateService;

    @Operation(summary = "Register Corporate Organization")
    @PostMapping
    public ResponseEntity<OrganizationResponse> registerOrganization(@Valid @RequestBody OrganizationRequest request) {
        return new ResponseEntity<>(corporateService.registerOrganization(request), HttpStatus.CREATED);
    }

    @Operation(summary = "Get Organization by ID")
    @GetMapping("/{id}")
    public ResponseEntity<OrganizationResponse> getOrganizationById(@PathVariable Long id) {
        return ResponseEntity.ok(corporateService.getOrganizationById(id));
    }

    @Operation(summary = "Register Corporate Facility / Campus")
    @PostMapping("/{orgId}/facilities")
    public ResponseEntity<CorporateFacilityDto> addFacility(
            @PathVariable Long orgId,
            @Valid @RequestBody CorporateFacilityDto dto) {
        dto.setOrganizationId(orgId);
        return new ResponseEntity<>(corporateService.addFacility(dto), HttpStatus.CREATED);
    }

    @Operation(summary = "Register Fleet Vehicle")
    @PostMapping("/{orgId}/fleet")
    public ResponseEntity<CorporateFleetVehicleDto> addFleetVehicle(
            @PathVariable Long orgId,
            @Valid @RequestBody CorporateFleetVehicleDto dto) {
        dto.setOrganizationId(orgId);
        return new ResponseEntity<>(corporateService.addFleetVehicle(dto), HttpStatus.CREATED);
    }

    @Operation(summary = "Get Fleet Vehicles for Organization")
    @GetMapping("/{orgId}/fleet")
    public ResponseEntity<List<CorporateFleetVehicleDto>> getFleetVehicles(@PathVariable Long orgId) {
        return ResponseEntity.ok(corporateService.getFleetVehicles(orgId));
    }

    @Operation(summary = "Create Recurring Wash Schedule")
    @PostMapping("/{orgId}/schedules")
    public ResponseEntity<CorporateRecurringScheduleDto> createRecurringSchedule(
            @PathVariable Long orgId,
            @Valid @RequestBody CorporateRecurringScheduleDto dto) {
        dto.setOrganizationId(orgId);
        return new ResponseEntity<>(corporateService.createRecurringSchedule(dto), HttpStatus.CREATED);
    }

    @Operation(summary = "Get Recurring Schedules for Organization")
    @GetMapping("/{orgId}/schedules")
    public ResponseEntity<List<CorporateRecurringScheduleDto>> getRecurringSchedules(@PathVariable Long orgId) {
        return ResponseEntity.ok(corporateService.getRecurringSchedules(orgId));
    }

    @Operation(summary = "Get Corporate Dashboard")
    @GetMapping("/{orgId}/dashboard")
    public ResponseEntity<CorporateDashboardResponse> getDashboard(@PathVariable Long orgId) {
        return ResponseEntity.ok(corporateService.getDashboard(orgId));
    }
}
