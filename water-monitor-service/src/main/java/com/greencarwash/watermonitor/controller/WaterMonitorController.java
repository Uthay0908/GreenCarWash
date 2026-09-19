package com.greencarwash.watermonitor.controller;

import com.greencarwash.common.core.dto.ApiResponse;
import com.greencarwash.common.security.util.SecurityUtils;
import com.greencarwash.watermonitor.dto.*;
import com.greencarwash.watermonitor.service.WaterLeaderboardService;
import com.greencarwash.watermonitor.service.WaterMonitorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/water")
@RequiredArgsConstructor
@Tag(name = "Water Monitor & Sustainability", description = "Endpoints for tracking water conservation, benchmarks, and community leaderboards")
public class WaterMonitorController {

    private final WaterMonitorService waterMonitorService;
    private final WaterLeaderboardService leaderboardService;

    @PostMapping("/records")
    @PreAuthorize("hasAnyRole('WASHER', 'ADMIN')")
    @Operation(summary = "Record actual water usage for a wash booking")
    public ResponseEntity<ApiResponse<WaterRecordResponse>> recordUsage(@Valid @RequestBody WaterRecordRequest request) {
        WaterRecordResponse response = waterMonitorService.recordWaterUsage(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Water usage recorded successfully"));
    }

    @GetMapping("/savings/me")
    @Operation(summary = "Get total water savings for the authenticated customer")
    public ResponseEntity<ApiResponse<WaterSavingsSummaryResponse>> getMySavings() {
        String customerId = SecurityUtils.getRequiredCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(waterMonitorService.getCustomerSavings(customerId)));
    }

    @GetMapping("/savings/customer/{customerId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get water savings for a specific customer (Admin)")
    public ResponseEntity<ApiResponse<WaterSavingsSummaryResponse>> getCustomerSavings(@PathVariable String customerId) {
        return ResponseEntity.ok(ApiResponse.success(waterMonitorService.getCustomerSavings(customerId)));
    }

    @GetMapping("/leaderboard")
    @Operation(summary = "Get top water savers (defaults to all-time)")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryResponse>>> getLeaderboard(
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(ApiResponse.success(leaderboardService.getAllTimeLeaderboard(limit)));
    }

    @GetMapping("/leaderboard/all-time")
    @Operation(summary = "Get all-time top water savers leaderboard")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryResponse>>> getAllTimeLeaderboard(
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(ApiResponse.success(leaderboardService.getAllTimeLeaderboard(limit)));
    }

    @GetMapping("/leaderboard/monthly")
    @Operation(summary = "Get monthly water conservation leaderboard")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryResponse>>> getMonthlyLeaderboard(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(ApiResponse.success(leaderboardService.getMonthlyLeaderboard(year, month, limit)));
    }

    @GetMapping("/stats/global")
    @Operation(summary = "Get platform-wide aggregate water savings statistics")
    public ResponseEntity<ApiResponse<GlobalWaterStatsResponse>> getGlobalStats() {
        return ResponseEntity.ok(ApiResponse.success(waterMonitorService.getGlobalStats()));
    }

    @GetMapping("/benchmarks")
    @Operation(summary = "Get all water consumption benchmarks by vehicle size")
    public ResponseEntity<ApiResponse<List<WaterBenchmarkDto>>> getBenchmarks() {
        return ResponseEntity.ok(ApiResponse.success(waterMonitorService.getAllBenchmarks()));
    }

    @PutMapping("/benchmarks")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Configure or update vehicle size water baseline benchmarks")
    public ResponseEntity<ApiResponse<WaterBenchmarkDto>> upsertBenchmark(@Valid @RequestBody WaterBenchmarkDto dto) {
        return ResponseEntity.ok(ApiResponse.success(waterMonitorService.upsertBenchmark(dto), "Benchmark updated"));
    }
}
