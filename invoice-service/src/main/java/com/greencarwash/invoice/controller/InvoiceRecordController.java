package com.greencarwash.invoice.controller;

import com.greencarwash.invoice.dto.request.RecordRequest;

import com.greencarwash.invoice.dto.response.RecordResponse;

import com.greencarwash.invoice.service.InvoiceRecordService;

import io.swagger.v3.oas.annotations.Operation;

import jakarta.validation.Valid;

import java.util.List;

import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/")
public class InvoiceRecordController {
    private final InvoiceRecordService service;

    public InvoiceRecordController(InvoiceRecordService service) { this.service = service; }

    @Operation(summary = "POST /api/invoices")
@PostMapping("/api/invoices")
    public RecordResponse endpoint0(@RequestBody RecordRequest request) {
        return service.create(request);
    }

    @Operation(summary = "GET /api/invoices/{invoiceId}")
@GetMapping("/api/invoices/{invoiceId}")
    public RecordResponse endpoint1(@PathVariable Long invoiceId) {
        return service.get(invoiceId);
    }

    @Operation(summary = "GET /api/invoices/booking/{bookingId}")
@GetMapping("/api/invoices/booking/{bookingId}")
    public RecordResponse endpoint2(@PathVariable Long bookingId) {
        return service.get(bookingId);
    }

    @Operation(summary = "GET /api/invoices/{invoiceId}/items")
@GetMapping("/api/invoices/{invoiceId}/items")
    public RecordResponse endpoint3(@PathVariable Long invoiceId) {
        return service.get(invoiceId);
    }

    @Operation(summary = "GET /api/invoices/{invoiceId}/download")
@GetMapping("/api/invoices/{invoiceId}/download")
    public RecordResponse endpoint4(@PathVariable Long invoiceId) {
        return service.get(invoiceId);
    }

    @Operation(summary = "POST /api/invoices/{invoiceId}/resend")
@PostMapping("/api/invoices/{invoiceId}/resend")
    public RecordResponse endpoint5(@PathVariable Long invoiceId, @RequestBody RecordRequest request) {
        return service.update(invoiceId, request);
    }
}
