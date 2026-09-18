package com.greencarwash.assignment.controller;

import com.greencarwash.assignment.dto.request.RecordRequest;

import com.greencarwash.assignment.dto.response.RecordResponse;

import com.greencarwash.assignment.service.AssignmentRecordService;

import io.swagger.v3.oas.annotations.Operation;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.PatchMapping;

import org.springframework.web.bind.annotation.PathVariable;

import org.springframework.web.bind.annotation.PostMapping;

import org.springframework.web.bind.annotation.RequestBody;

import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/")
public class AssignmentRecordController {

    private final AssignmentRecordService service;

    public AssignmentRecordController(AssignmentRecordService service) {
        this.service = service;
    }

    @Operation(summary = "GET /api/assignments/eligible-washers")
    @GetMapping("/api/assignments/eligible-washers")
    public List<RecordResponse> endpoint0() {
        return service.all();
    }

    @Operation(summary = "POST /api/assignments")
    @PostMapping("/api/assignments")
    public RecordResponse endpoint1(@RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "GET /api/assignments/{assignmentId}")
    @GetMapping("/api/assignments/{assignmentId}")
    public RecordResponse endpoint2(@PathVariable Long assignmentId) {
        return service.get(assignmentId);
    }

    @Operation(summary = "POST /api/assignments/{assignmentId}/accept")
    @PostMapping("/api/assignments/{assignmentId}/accept")
    public RecordResponse endpoint3(@PathVariable Long assignmentId, @RequestBody RecordRequest request) {
        return service.update(assignmentId, request);
    }

    @Operation(summary = "POST /api/assignments/{assignmentId}/reject")
    @PostMapping("/api/assignments/{assignmentId}/reject")
    public RecordResponse endpoint4(@PathVariable Long assignmentId, @RequestBody RecordRequest request) {
        return service.update(assignmentId, request);
    }

    @Operation(summary = "POST /api/assignments/{assignmentId}/reassign")
    @PostMapping("/api/assignments/{assignmentId}/reassign")
    public RecordResponse endpoint5(@PathVariable Long assignmentId, @RequestBody RecordRequest request) {
        return service.update(assignmentId, request);
    }

    @Operation(summary = "POST /api/assignments/{assignmentId}/arrived")
    @PostMapping("/api/assignments/{assignmentId}/arrived")
    public RecordResponse endpoint6(@PathVariable Long assignmentId, @RequestBody RecordRequest request) {
        return service.update(assignmentId, request);
    }

    @Operation(summary = "PATCH /api/assignments/{assignmentId}/eta")
    @PatchMapping("/api/assignments/{assignmentId}/eta")
    public RecordResponse endpoint7(@PathVariable Long assignmentId, @RequestBody RecordRequest request) {
        return service.update(assignmentId, request);
    }

    @Operation(summary = "POST /api/assignments/{assignmentId}/start")
    @PostMapping("/api/assignments/{assignmentId}/start")
    public RecordResponse endpoint8(@PathVariable Long assignmentId, @RequestBody RecordRequest request) {
        return service.update(assignmentId, request);
    }

    @Operation(summary = "POST /api/assignments/{assignmentId}/no-show")
    @PostMapping("/api/assignments/{assignmentId}/no-show")
    public RecordResponse endpoint9(@PathVariable Long assignmentId, @RequestBody RecordRequest request) {
        return service.update(assignmentId, request);
    }

    @Operation(summary = "GET /api/washers/{washerId}/assignments/current")
    @GetMapping("/api/washers/{washerId}/assignments/current")
    public RecordResponse endpoint10(@PathVariable Long washerId) {
        return service.get(washerId);
    }

    @Operation(summary = "GET /api/washers/{washerId}/assignments/past")
    @GetMapping("/api/washers/{washerId}/assignments/past")
    public RecordResponse endpoint11(@PathVariable Long washerId) {
        return service.get(washerId);
    }

    @Operation(summary = "GET /api/washers/{washerId}/assignment-performance")
    @GetMapping("/api/washers/{washerId}/assignment-performance")
    public RecordResponse endpoint12(@PathVariable Long washerId) {
        return service.get(washerId);
    }

    @Operation(summary = "GET /api/assignments/sla/breaches")
    @GetMapping("/api/assignments/sla/breaches")
    public List<RecordResponse> endpoint13() {
        return service.all();
    }
}
