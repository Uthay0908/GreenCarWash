package com.greencarwash.notification.controller;

import com.greencarwash.notification.dto.request.RecordRequest;

import com.greencarwash.notification.dto.response.RecordResponse;

import com.greencarwash.notification.service.NotificationRecordService;

import io.swagger.v3.oas.annotations.Operation;

import jakarta.validation.Valid;

import java.util.List;

import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/")
public class NotificationRecordController {
    private final NotificationRecordService service;

    public NotificationRecordController(NotificationRecordService service) { this.service = service; }

    @Operation(summary = "GET /api/notifications")
@GetMapping("/api/notifications")
    public List<RecordResponse> endpoint0() {
        return service.all();
    }

    @Operation(summary = "GET /api/notifications/{notificationId}")
@GetMapping("/api/notifications/{notificationId}")
    public RecordResponse endpoint1(@PathVariable Long notificationId) {
        return service.get(notificationId);
    }

    @Operation(summary = "PATCH /api/notifications/{notificationId}/read")
@PatchMapping("/api/notifications/{notificationId}/read")
    public RecordResponse endpoint2(@PathVariable Long notificationId, @RequestBody RecordRequest request) {
        return service.update(notificationId, request);
    }

    @Operation(summary = "PATCH /api/notifications/read-all")
@PatchMapping("/api/notifications/read-all")
    public RecordResponse endpoint3(@RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "GET /api/notifications/preferences")
@GetMapping("/api/notifications/preferences")
    public List<RecordResponse> endpoint4() {
        return service.all();
    }

    @Operation(summary = "PUT /api/notifications/preferences")
@PutMapping("/api/notifications/preferences")
    public RecordResponse endpoint5(@RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "POST /api/notifications/test")
@PostMapping("/api/notifications/test")
    public RecordResponse endpoint6(@RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "GET /api/notifications/history")
@GetMapping("/api/notifications/history")
    public List<RecordResponse> endpoint7() {
        return service.all();
    }

    @Operation(summary = "GET /api/notification-templates")
@GetMapping("/api/notification-templates")
    public List<RecordResponse> endpoint8() {
        return service.all();
    }

    @Operation(summary = "POST /api/notification-templates")
@PostMapping("/api/notification-templates")
    public RecordResponse endpoint9(@RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "PUT /api/notification-templates/{templateId}")
@PutMapping("/api/notification-templates/{templateId}")
    public RecordResponse endpoint10(@PathVariable Long templateId, @RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "POST /api/notifications/broadcast")
@PostMapping("/api/notifications/broadcast")
    public RecordResponse endpoint11(@RequestBody RecordRequest request) {
        return service.create(request);
    }
}
