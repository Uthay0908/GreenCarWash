package com.greencarwash.reporting.controller;

import com.greencarwash.reporting.dto.request.RecordRequest;

import com.greencarwash.reporting.dto.response.RecordResponse;

import com.greencarwash.reporting.service.ReportingRecordService;

import io.swagger.v3.oas.annotations.Operation;

import jakarta.validation.Valid;

import java.util.List;

import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/")
public class ReportingRecordController {
    private final ReportingRecordService service;

    public ReportingRecordController(ReportingRecordService service) { this.service = service; }

    @Operation(summary = "GET /api/reports/orders")
@GetMapping("/api/reports/orders")
    public List<RecordResponse> endpoint0() {
        return service.all();
    }

    @Operation(summary = "GET /api/reports/sales")
@GetMapping("/api/reports/sales")
    public List<RecordResponse> endpoint1() {
        return service.all();
    }

    @Operation(summary = "GET /api/reports/users")
@GetMapping("/api/reports/users")
    public List<RecordResponse> endpoint2() {
        return service.all();
    }

    @Operation(summary = "GET /api/reports/vehicles")
@GetMapping("/api/reports/vehicles")
    public List<RecordResponse> endpoint3() {
        return service.all();
    }

    @Operation(summary = "GET /api/reports/locations")
@GetMapping("/api/reports/locations")
    public List<RecordResponse> endpoint4() {
        return service.all();
    }

    @Operation(summary = "GET /api/reports/washer-performance")
@GetMapping("/api/reports/washer-performance")
    public List<RecordResponse> endpoint5() {
        return service.all();
    }

    @Operation(summary = "GET /api/reports/payments")
@GetMapping("/api/reports/payments")
    public List<RecordResponse> endpoint6() {
        return service.all();
    }

    @Operation(summary = "GET /api/reports/refunds")
@GetMapping("/api/reports/refunds")
    public List<RecordResponse> endpoint7() {
        return service.all();
    }

    @Operation(summary = "GET /api/reports/cancellations")
@GetMapping("/api/reports/cancellations")
    public List<RecordResponse> endpoint8() {
        return service.all();
    }

    @Operation(summary = "GET /api/reports/water-saving")
@GetMapping("/api/reports/water-saving")
    public List<RecordResponse> endpoint9() {
        return service.all();
    }

    @Operation(summary = "GET /api/reports/loyalty")
@GetMapping("/api/reports/loyalty")
    public List<RecordResponse> endpoint10() {
        return service.all();
    }

    @Operation(summary = "GET /api/reports/complaints")
@GetMapping("/api/reports/complaints")
    public List<RecordResponse> endpoint11() {
        return service.all();
    }

    @Operation(summary = "GET /api/reports/advanced")
@GetMapping("/api/reports/advanced")
    public List<RecordResponse> endpoint12() {
        return service.all();
    }

    @Operation(summary = "POST /api/reports/export")
@PostMapping("/api/reports/export")
    public RecordResponse endpoint13(@RequestBody RecordRequest request) {
        return service.create(request);
    }
}
