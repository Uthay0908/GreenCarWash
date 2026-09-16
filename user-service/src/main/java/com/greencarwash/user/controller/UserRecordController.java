package com.greencarwash.user.controller;

import com.greencarwash.user.dto.request.RecordRequest;

import com.greencarwash.user.dto.response.RecordResponse;

import com.greencarwash.user.service.UserRecordService;

import io.swagger.v3.oas.annotations.Operation;

import jakarta.validation.Valid;

import java.util.List;

import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/")
public class UserRecordController {
    private final UserRecordService service;

    public UserRecordController(UserRecordService service) { this.service = service; }

    @Operation(summary = "GET /api/users/{userId}")
@GetMapping("/api/users/{userId}")
    public RecordResponse endpoint0(@PathVariable Long userId) {
        return service.get(userId);
    }

    @Operation(summary = "PUT /api/users/{userId}")
@PutMapping("/api/users/{userId}")
    public RecordResponse endpoint1(@PathVariable Long userId, @RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "PATCH /api/users/{userId}/status")
@PatchMapping("/api/users/{userId}/status")
    public RecordResponse endpoint2(@PathVariable Long userId, @RequestBody RecordRequest request) {
        return service.update(userId, request);
    }

    @Operation(summary = "GET /api/users/{userId}/preferences")
@GetMapping("/api/users/{userId}/preferences")
    public RecordResponse endpoint3(@PathVariable Long userId) {
        return service.get(userId);
    }

    @Operation(summary = "PUT /api/users/{userId}/preferences")
@PutMapping("/api/users/{userId}/preferences")
    public RecordResponse endpoint4(@PathVariable Long userId, @RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "GET /api/customers/{customerId}")
@GetMapping("/api/customers/{customerId}")
    public RecordResponse endpoint5(@PathVariable Long customerId) {
        return service.get(customerId);
    }

    @Operation(summary = "PUT /api/customers/{customerId}")
@PutMapping("/api/customers/{customerId}")
    public RecordResponse endpoint6(@PathVariable Long customerId, @RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "GET /api/customers/{customerId}/addresses")
@GetMapping("/api/customers/{customerId}/addresses")
    public RecordResponse endpoint7(@PathVariable Long customerId) {
        return service.get(customerId);
    }

    @Operation(summary = "POST /api/customers/{customerId}/addresses")
@PostMapping("/api/customers/{customerId}/addresses")
    public RecordResponse endpoint8(@PathVariable Long customerId, @RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "PUT /api/addresses/{addressId}")
@PutMapping("/api/addresses/{addressId}")
    public RecordResponse endpoint9(@PathVariable Long addressId, @RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "DELETE /api/addresses/{addressId}")
@DeleteMapping("/api/addresses/{addressId}")
    public Map<String,String> endpoint10(@PathVariable Long addressId) {
        service.delete(addressId); return Map.of("message", "Deleted successfully");
    }
}
