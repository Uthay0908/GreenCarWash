package com.greencarwash.payment.controller;

import com.greencarwash.payment.dto.request.RecordRequest;

import com.greencarwash.payment.dto.response.RecordResponse;

import com.greencarwash.payment.service.PaymentRecordService;

import io.swagger.v3.oas.annotations.Operation;

import jakarta.validation.Valid;

import java.util.List;

import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/")
public class PaymentRecordController {
    private final PaymentRecordService service;

    public PaymentRecordController(PaymentRecordService service) { this.service = service; }

    @Operation(summary = "POST /api/payments")
@PostMapping("/api/payments")
    public RecordResponse endpoint0(@RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "GET /api/payments/{paymentId}")
@GetMapping("/api/payments/{paymentId}")
    public RecordResponse endpoint1(@PathVariable Long paymentId) {
        return service.get(paymentId);
    }

    @Operation(summary = "GET /api/payments/booking/{bookingId}")
@GetMapping("/api/payments/booking/{bookingId}")
    public RecordResponse endpoint2(@PathVariable Long bookingId) {
        return service.get(bookingId);
    }

    @Operation(summary = "POST /api/payments/retry")
@PostMapping("/api/payments/retry")
    public RecordResponse endpoint3(@RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "POST /api/payments/additional")
@PostMapping("/api/payments/additional")
    public RecordResponse endpoint4(@RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "POST /api/payments/{paymentId}/refund")
@PostMapping("/api/payments/{paymentId}/refund")
    public RecordResponse endpoint5(@PathVariable Long paymentId, @RequestBody RecordRequest request) {
        return service.update(paymentId, request);
    }

    @Operation(summary = "GET /api/refunds/{refundId}")
@GetMapping("/api/refunds/{refundId}")
    public RecordResponse endpoint6(@PathVariable Long refundId) {
        return service.get(refundId);
    }

    @Operation(summary = "GET /api/payments/{paymentId}/status")
@GetMapping("/api/payments/{paymentId}/status")
    public RecordResponse endpoint7(@PathVariable Long paymentId) {
        return service.get(paymentId);
    }

    @Operation(summary = "POST /api/payments/webhook")
@PostMapping("/api/payments/webhook")
    public RecordResponse endpoint8(@RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "GET /api/payments/history")
@GetMapping("/api/payments/history")
    public List<RecordResponse> endpoint9() {
        return service.all();
    }
}
