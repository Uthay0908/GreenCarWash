package com.greencarwash.loyalty.controller;

import com.greencarwash.loyalty.dto.request.RecordRequest;

import com.greencarwash.loyalty.dto.response.RecordResponse;

import com.greencarwash.loyalty.service.LoyaltyRecordService;

import io.swagger.v3.oas.annotations.Operation;

import jakarta.validation.Valid;

import java.util.List;

import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/")
public class LoyaltyRecordController {
    private final LoyaltyRecordService service;

    public LoyaltyRecordController(LoyaltyRecordService service) { this.service = service; }

    @Operation(summary = "GET /api/loyalty/account")
@GetMapping("/api/loyalty/account")
    public List<RecordResponse> endpoint0() {
        return service.all();
    }

    @Operation(summary = "GET /api/loyalty/transactions")
@GetMapping("/api/loyalty/transactions")
    public List<RecordResponse> endpoint1() {
        return service.all();
    }

    @Operation(summary = "POST /api/loyalty/redeem")
@PostMapping("/api/loyalty/redeem")
    public RecordResponse endpoint2(@RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "GET /api/memberships")
@GetMapping("/api/memberships")
    public List<RecordResponse> endpoint3() {
        return service.all();
    }

    @Operation(summary = "POST /api/memberships")
@PostMapping("/api/memberships")
    public RecordResponse endpoint4(@RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "GET /api/memberships/{membershipId}")
@GetMapping("/api/memberships/{membershipId}")
    public RecordResponse endpoint5(@PathVariable Long membershipId) {
        return service.get(membershipId);
    }

    @Operation(summary = "PATCH /api/memberships/{membershipId}/status")
@PatchMapping("/api/memberships/{membershipId}/status")
    public RecordResponse endpoint6(@PathVariable Long membershipId, @RequestBody RecordRequest request) {
        return service.update(membershipId, request);
    }

    @Operation(summary = "POST /api/referrals")
@PostMapping("/api/referrals")
    public RecordResponse endpoint7(@RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "GET /api/referrals")
@GetMapping("/api/referrals")
    public List<RecordResponse> endpoint8() {
        return service.all();
    }

    @Operation(summary = "GET /api/leaderboard/water-saving")
@GetMapping("/api/leaderboard/water-saving")
    public List<RecordResponse> endpoint9() {
        return service.all();
    }

    @Operation(summary = "GET /api/loyalty/rewards")
@GetMapping("/api/loyalty/rewards")
    public List<RecordResponse> endpoint10() {
        return service.all();
    }

    @Operation(summary = "GET /api/loyalty/water-saving")
@GetMapping("/api/loyalty/water-saving")
    public List<RecordResponse> endpoint11() {
        return service.all();
    }
}
