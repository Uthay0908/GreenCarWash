package com.greencarwash.vehicle.controller;

import com.greencarwash.vehicle.dto.request.RecordRequest;

import com.greencarwash.vehicle.dto.response.RecordResponse;

import com.greencarwash.vehicle.service.VehicleRecordService;

import io.swagger.v3.oas.annotations.Operation;

import jakarta.validation.Valid;

import java.util.List;

import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/")
public class VehicleRecordController {
    private final VehicleRecordService service;

    public VehicleRecordController(VehicleRecordService service) { this.service = service; }

    @Operation(summary = "GET /api/customers/{customerId}/vehicles")
@GetMapping("/api/customers/{customerId}/vehicles")
    public RecordResponse endpoint0(@PathVariable Long customerId) {
        return service.get(customerId);
    }

    @Operation(summary = "POST /api/customers/{customerId}/vehicles")
@PostMapping("/api/customers/{customerId}/vehicles")
    public RecordResponse endpoint1(@PathVariable Long customerId, @RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "GET /api/vehicles/{vehicleId}")
@GetMapping("/api/vehicles/{vehicleId}")
    public RecordResponse endpoint2(@PathVariable Long vehicleId) {
        return service.get(vehicleId);
    }

    @Operation(summary = "PUT /api/vehicles/{vehicleId}")
@PutMapping("/api/vehicles/{vehicleId}")
    public RecordResponse endpoint3(@PathVariable Long vehicleId, @RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "PATCH /api/vehicles/{vehicleId}/status")
@PatchMapping("/api/vehicles/{vehicleId}/status")
    public RecordResponse endpoint4(@PathVariable Long vehicleId, @RequestBody RecordRequest request) {
        return service.update(vehicleId, request);
    }

    @Operation(summary = "DELETE /api/vehicles/{vehicleId}")
@DeleteMapping("/api/vehicles/{vehicleId}")
    public Map<String,String> endpoint5(@PathVariable Long vehicleId) {
        service.delete(vehicleId); return Map.of("message", "Deleted successfully");
    }

    @Operation(summary = "GET /api/vehicles/{vehicleId}/service-history")
@GetMapping("/api/vehicles/{vehicleId}/service-history")
    public RecordResponse endpoint6(@PathVariable Long vehicleId) {
        return service.get(vehicleId);
    }

    @Operation(summary = "GET /api/vehicles/{vehicleId}/recommendations")
@GetMapping("/api/vehicles/{vehicleId}/recommendations")
    public RecordResponse endpoint7(@PathVariable Long vehicleId) {
        return service.get(vehicleId);
    }
}
