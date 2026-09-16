package com.greencarwash.catalog.controller;

import com.greencarwash.catalog.dto.request.RecordRequest;

import com.greencarwash.catalog.dto.response.RecordResponse;

import com.greencarwash.catalog.service.CatalogRecordService;

import io.swagger.v3.oas.annotations.Operation;

import jakarta.validation.Valid;

import java.util.List;

import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/")
public class CatalogRecordController {
    private final CatalogRecordService service;

    public CatalogRecordController(CatalogRecordService service) { this.service = service; }

    @Operation(summary = "GET /api/packages")
@GetMapping("/api/packages")
    public List<RecordResponse> endpoint0() {
        return service.all();
    }

    @Operation(summary = "POST /api/packages")
@PostMapping("/api/packages")
    public RecordResponse endpoint1(@RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "GET /api/packages/{packageId}")
@GetMapping("/api/packages/{packageId}")
    public RecordResponse endpoint2(@PathVariable Long packageId) {
        return service.get(packageId);
    }

    @Operation(summary = "PUT /api/packages/{packageId}")
@PutMapping("/api/packages/{packageId}")
    public RecordResponse endpoint3(@PathVariable Long packageId, @RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "PATCH /api/packages/{packageId}/status")
@PatchMapping("/api/packages/{packageId}/status")
    public RecordResponse endpoint4(@PathVariable Long packageId, @RequestBody RecordRequest request) {
        return service.update(packageId, request);
    }

    @Operation(summary = "GET /api/packages/{packageId}/tasks")
@GetMapping("/api/packages/{packageId}/tasks")
    public RecordResponse endpoint5(@PathVariable Long packageId) {
        return service.get(packageId);
    }

    @Operation(summary = "POST /api/packages/{packageId}/tasks")
@PostMapping("/api/packages/{packageId}/tasks")
    public RecordResponse endpoint6(@PathVariable Long packageId, @RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "PUT /api/packages/{packageId}/tasks/{taskId}")
@PutMapping("/api/packages/{packageId}/tasks/{taskId}")
    public RecordResponse endpoint7(@PathVariable Long packageId, @PathVariable Long taskId, @RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "DELETE /api/packages/{packageId}/tasks/{taskId}")
@DeleteMapping("/api/packages/{packageId}/tasks/{taskId}")
    public Map<String,String> endpoint8(@PathVariable Long packageId, @PathVariable Long taskId) {
        service.delete(taskId); return Map.of("message", "Deleted successfully");
    }

    @Operation(summary = "GET /api/addons")
@GetMapping("/api/addons")
    public List<RecordResponse> endpoint9() {
        return service.all();
    }

    @Operation(summary = "POST /api/addons")
@PostMapping("/api/addons")
    public RecordResponse endpoint10(@RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "GET /api/addons/{addonId}")
@GetMapping("/api/addons/{addonId}")
    public RecordResponse endpoint11(@PathVariable Long addonId) {
        return service.get(addonId);
    }

    @Operation(summary = "PUT /api/addons/{addonId}")
@PutMapping("/api/addons/{addonId}")
    public RecordResponse endpoint12(@PathVariable Long addonId, @RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "PATCH /api/addons/{addonId}/status")
@PatchMapping("/api/addons/{addonId}/status")
    public RecordResponse endpoint13(@PathVariable Long addonId, @RequestBody RecordRequest request) {
        return service.update(addonId, request);
    }

    @Operation(summary = "GET /api/promotions")
@GetMapping("/api/promotions")
    public List<RecordResponse> endpoint14() {
        return service.all();
    }

    @Operation(summary = "POST /api/promotions")
@PostMapping("/api/promotions")
    public RecordResponse endpoint15(@RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "PUT /api/promotions/{promotionId}")
@PutMapping("/api/promotions/{promotionId}")
    public RecordResponse endpoint16(@PathVariable Long promotionId, @RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "PATCH /api/promotions/{promotionId}/status")
@PatchMapping("/api/promotions/{promotionId}/status")
    public RecordResponse endpoint17(@PathVariable Long promotionId, @RequestBody RecordRequest request) {
        return service.update(promotionId, request);
    }

    @Operation(summary = "GET /api/serviceability")
@GetMapping("/api/serviceability")
    public List<RecordResponse> endpoint18() {
        return service.all();
    }
}
