package com.greencarwash.assignment.controller;

import com.greencarwash.assignment.dto.*;
import com.greencarwash.assignment.service.ProximityService;
import com.greencarwash.assignment.service.WasherAssignmentService;
import com.greencarwash.common.core.dto.ApiResponse;
import com.greencarwash.common.core.util.CorrelationContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
@Tag(name = "Washer Assignment", description = "Endpoints for smart automated dispatch, custom washer selection, and acceptance SLA handling")
public class AssignmentController {

    private final WasherAssignmentService assignmentService;
    private final ProximityService proximityService;

    @PostMapping("/auto")
    @Operation(summary = "Auto-assign nearest available washer using proximity & ranking algorithm")
    public ResponseEntity<ApiResponse<AssignmentResponse>> autoAssign(@Valid @RequestBody AutoAssignRequest request) {
        AssignmentResponse response = assignmentService.autoAssign(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Washer assignment dispatched", CorrelationContext.getCorrelationId()));
    }

    @PostMapping("/custom")
    @Operation(summary = "Customer selects specific washer from candidate list")
    public ResponseEntity<ApiResponse<AssignmentResponse>> customAssign(@Valid @RequestBody CustomAssignRequest request) {
        AssignmentResponse response = assignmentService.customAssign(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Custom washer assignment dispatched", CorrelationContext.getCorrelationId()));
    }

    @GetMapping("/candidates")
    @Operation(summary = "Find and rank nearby available washers for custom customer selection")
    public ResponseEntity<ApiResponse<List<WasherCandidateResponse>>> getCandidates(
            @RequestParam("latitude") double latitude,
            @RequestParam("longitude") double longitude) {
        List<WasherCandidateResponse> candidates = proximityService.findAndRankCandidates(latitude, longitude);
        return ResponseEntity.ok(ApiResponse.success(candidates, "Ranked washer candidates retrieved", CorrelationContext.getCorrelationId()));
    }

    @PatchMapping("/{assignmentId}/response")
    @Operation(summary = "Washer accepts or rejects the incoming dispatch request")
    public ResponseEntity<ApiResponse<AssignmentResponse>> handleResponse(
            @PathVariable("assignmentId") String assignmentId,
            @Valid @RequestBody WasherResponseActionRequest request) {
        AssignmentResponse response = assignmentService.handleWasherResponse(assignmentId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Washer response recorded", CorrelationContext.getCorrelationId()));
    }

    @GetMapping("/{assignmentId}")
    @Operation(summary = "Get assignment details by assignment ID")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignment(@PathVariable("assignmentId") String assignmentId) {
        AssignmentResponse response = assignmentService.getAssignment(assignmentId);
        return ResponseEntity.ok(ApiResponse.success(response, "Assignment retrieved", CorrelationContext.getCorrelationId()));
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get assignment history for a booking")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAssignmentsByBooking(@PathVariable("bookingId") String bookingId) {
        List<AssignmentResponse> responses = assignmentService.getAssignmentsByBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success(responses, "Booking assignments retrieved", CorrelationContext.getCorrelationId()));
    }
}
