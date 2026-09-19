package com.greencarwash.booking.controller;

import com.greencarwash.booking.dto.BookingCreateRequest;
import com.greencarwash.booking.dto.BookingResponse;
import com.greencarwash.booking.dto.StatusUpdateRequest;
import com.greencarwash.booking.service.BookingService;
import com.greencarwash.common.core.dto.ApiResponse;
import com.greencarwash.common.core.util.CorrelationContext;
import com.greencarwash.common.security.model.UserPrincipal;
import com.greencarwash.common.security.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Endpoints for booking creation, lifecycle state transitions, and tracking")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @Operation(summary = "Create a new car wash booking (Wash Now, Schedule Later, or Recurring)")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingCreateRequest request) {
        UserPrincipal user = SecurityUtils.getCurrentUser().orElseThrow();
        BookingResponse response = bookingService.createBooking(
                user.getUserId(),
                user.getEmail(),
                user.getUsername(),
                request
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Booking created successfully", CorrelationContext.getCorrelationId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get full booking details by ID including current status and dynamic checklist")
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(@PathVariable("id") String id) {
        BookingResponse response = bookingService.getBooking(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking retrieved", CorrelationContext.getCorrelationId()));
    }

    @GetMapping("/my-bookings")
    @Operation(summary = "List all bookings for the authenticated customer")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings() {
        String customerId = SecurityUtils.getRequiredCurrentUserId();
        List<BookingResponse> responses = bookingService.getCustomerBookings(customerId);
        return ResponseEntity.ok(ApiResponse.success(responses, "Customer bookings retrieved", CorrelationContext.getCorrelationId()));
    }

    @GetMapping("/washer/my-jobs")
    @Operation(summary = "List all jobs assigned to the authenticated washer")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getWasherJobs() {
        String washerId = SecurityUtils.getRequiredCurrentUserId();
        List<BookingResponse> responses = bookingService.getWasherBookings(washerId);
        return ResponseEntity.ok(ApiResponse.success(responses, "Washer jobs retrieved", CorrelationContext.getCorrelationId()));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Advance booking lifecycle state (e.g. WASHER_ON_THE_WAY, SERVICE_STARTED, SERVICE_COMPLETED)")
    public ResponseEntity<ApiResponse<BookingResponse>> updateStatus(
            @PathVariable("id") String id,
            @Valid @RequestBody StatusUpdateRequest request) {
        String actorId = SecurityUtils.getRequiredCurrentUserId();
        BookingResponse response = bookingService.updateStatus(id, actorId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking status updated to " + request.getNewStatus(), CorrelationContext.getCorrelationId()));
    }
}
