package com.greencarwash.review.controller;

import com.greencarwash.review.dto.request.RecordRequest;

import com.greencarwash.review.dto.response.RecordResponse;

import com.greencarwash.review.service.ReviewRecordService;

import io.swagger.v3.oas.annotations.Operation;

import jakarta.validation.Valid;

import java.util.List;

import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/")
public class ReviewRecordController {
    private final ReviewRecordService service;

    public ReviewRecordController(ReviewRecordService service) { this.service = service; }

    @Operation(summary = "POST /api/reviews")
@PostMapping("/api/reviews")
    public RecordResponse endpoint0(@RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "GET /api/reviews/{reviewId}")
@GetMapping("/api/reviews/{reviewId}")
    public RecordResponse endpoint1(@PathVariable Long reviewId) {
        return service.get(reviewId);
    }

    @Operation(summary = "GET /api/reviews/booking/{bookingId}")
@GetMapping("/api/reviews/booking/{bookingId}")
    public RecordResponse endpoint2(@PathVariable Long bookingId) {
        return service.get(bookingId);
    }

    @Operation(summary = "GET /api/reviews/washer/{washerId}")
@GetMapping("/api/reviews/washer/{washerId}")
    public RecordResponse endpoint3(@PathVariable Long washerId) {
        return service.get(washerId);
    }

    @Operation(summary = "GET /api/reviews/customer/{customerId}")
@GetMapping("/api/reviews/customer/{customerId}")
    public RecordResponse endpoint4(@PathVariable Long customerId) {
        return service.get(customerId);
    }

    @Operation(summary = "PUT /api/reviews/{reviewId}")
@PutMapping("/api/reviews/{reviewId}")
    public RecordResponse endpoint5(@PathVariable Long reviewId, @RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "DELETE /api/reviews/{reviewId}")
@DeleteMapping("/api/reviews/{reviewId}")
    public Map<String,String> endpoint6(@PathVariable Long reviewId) {
        service.delete(reviewId); return Map.of("message", "Deleted successfully");
    }

    @Operation(summary = "POST /api/reviews/{reviewId}/photos")
@PostMapping("/api/reviews/{reviewId}/photos")
    public RecordResponse endpoint7(@PathVariable Long reviewId, @RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "PATCH /api/reviews/{reviewId}/moderation")
@PatchMapping("/api/reviews/{reviewId}/moderation")
    public RecordResponse endpoint8(@PathVariable Long reviewId, @RequestBody RecordRequest request) {
        return service.update(reviewId, request);
    }

    @Operation(summary = "GET /api/ratings/washer/{washerId}")
@GetMapping("/api/ratings/washer/{washerId}")
    public RecordResponse endpoint9(@PathVariable Long washerId) {
        return service.get(washerId);
    }
}
