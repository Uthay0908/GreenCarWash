package com.greencarwash.booking.controller;

import com.greencarwash.booking.dto.request.RecordRequest;

import com.greencarwash.booking.dto.response.RecordResponse;

import com.greencarwash.booking.service.BookingRecordService;

import io.swagger.v3.oas.annotations.Operation;

import jakarta.validation.Valid;

import java.util.List;

import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/")
public class BookingRecordController {
    private final BookingRecordService service;

    public BookingRecordController(BookingRecordService service) { this.service = service; }

    @Operation(summary = "GET /api/bookings/slots")
@GetMapping("/api/bookings/slots")
    public List<RecordResponse> endpoint0() {
        return service.all();
    }

    @Operation(summary = "POST /api/bookings/wash-now")
@PostMapping("/api/bookings/wash-now")
    public RecordResponse endpoint1(@RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "POST /api/bookings/schedule")
@PostMapping("/api/bookings/schedule")
    public RecordResponse endpoint2(@RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "POST /api/bookings/recurring")
@PostMapping("/api/bookings/recurring")
    public RecordResponse endpoint3(@RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "POST /api/bookings/admin-create")
@PostMapping("/api/bookings/admin-create")
    public RecordResponse endpoint4(@RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "GET /api/bookings/{bookingId}")
@GetMapping("/api/bookings/{bookingId}")
    public RecordResponse endpoint5(@PathVariable Long bookingId) {
        return service.get(bookingId);
    }

    @Operation(summary = "GET /api/bookings/current")
@GetMapping("/api/bookings/current")
    public List<RecordResponse> endpoint6() {
        return service.all();
    }

    @Operation(summary = "GET /api/bookings/past")
@GetMapping("/api/bookings/past")
    public List<RecordResponse> endpoint7() {
        return service.all();
    }

    @Operation(summary = "PATCH /api/bookings/{bookingId}/cancel")
@PatchMapping("/api/bookings/{bookingId}/cancel")
    public RecordResponse endpoint8(@PathVariable Long bookingId, @RequestBody RecordRequest request) {
        return service.update(bookingId, request);
    }

    @Operation(summary = "PATCH /api/bookings/{bookingId}/reschedule")
@PatchMapping("/api/bookings/{bookingId}/reschedule")
    public RecordResponse endpoint9(@PathVariable Long bookingId, @RequestBody RecordRequest request) {
        return service.update(bookingId, request);
    }

    @Operation(summary = "POST /api/bookings/{bookingId}/rebook")
@PostMapping("/api/bookings/{bookingId}/rebook")
    public RecordResponse endpoint10(@PathVariable Long bookingId, @RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "GET /api/bookings/{bookingId}/timeline")
@GetMapping("/api/bookings/{bookingId}/timeline")
    public RecordResponse endpoint11(@PathVariable Long bookingId) {
        return service.get(bookingId);
    }

    @Operation(summary = "GET /api/bookings/{bookingId}/checklist")
@GetMapping("/api/bookings/{bookingId}/checklist")
    public RecordResponse endpoint12(@PathVariable Long bookingId) {
        return service.get(bookingId);
    }

    @Operation(summary = "PATCH /api/bookings/{bookingId}/checklist/{itemId}")
@PatchMapping("/api/bookings/{bookingId}/checklist/{itemId}")
    public RecordResponse endpoint13(@PathVariable Long bookingId, @PathVariable Long itemId, @RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "POST /api/bookings/{bookingId}/water-usage")
@PostMapping("/api/bookings/{bookingId}/water-usage")
    public RecordResponse endpoint14(@PathVariable Long bookingId, @RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "GET /api/bookings/{bookingId}/water-summary")
@GetMapping("/api/bookings/{bookingId}/water-summary")
    public RecordResponse endpoint15(@PathVariable Long bookingId) {
        return service.get(bookingId);
    }

    @Operation(summary = "POST /api/bookings/{bookingId}/additional-addons")
@PostMapping("/api/bookings/{bookingId}/additional-addons")
    public RecordResponse endpoint16(@PathVariable Long bookingId, @RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "GET /api/bookings/{bookingId}/additional-addons")
@GetMapping("/api/bookings/{bookingId}/additional-addons")
    public RecordResponse endpoint17(@PathVariable Long bookingId) {
        return service.get(bookingId);
    }

    @Operation(summary = "GET /api/bookings/{bookingId}/inspection")
@GetMapping("/api/bookings/{bookingId}/inspection")
    public RecordResponse endpoint18(@PathVariable Long bookingId) {
        return service.get(bookingId);
    }

    @Operation(summary = "POST /api/bookings/{bookingId}/inspection/confirm")
@PostMapping("/api/bookings/{bookingId}/inspection/confirm")
    public RecordResponse endpoint19(@PathVariable Long bookingId, @RequestBody RecordRequest request) {
        return service.update(bookingId, request);
    }

    @Operation(summary = "POST /api/bookings/{bookingId}/chat/messages")
@PostMapping("/api/bookings/{bookingId}/chat/messages")
    public RecordResponse endpoint20(@PathVariable Long bookingId, @RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "GET /api/bookings/{bookingId}/chat/messages")
@GetMapping("/api/bookings/{bookingId}/chat/messages")
    public RecordResponse endpoint21(@PathVariable Long bookingId) {
        return service.get(bookingId);
    }
}
