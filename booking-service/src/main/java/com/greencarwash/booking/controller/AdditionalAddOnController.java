package com.greencarwash.booking.controller;

import com.greencarwash.booking.dto.AdditionalAddOnCreateRequest;
import com.greencarwash.booking.dto.AdditionalAddOnReviewRequest;
import com.greencarwash.booking.entity.AdditionalAddOnRequest;
import com.greencarwash.booking.service.AdditionalAddOnService;
import com.greencarwash.common.core.dto.ApiResponse;
import com.greencarwash.common.core.util.CorrelationContext;
import com.greencarwash.common.security.util.SecurityUtils;
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
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Additional Add-Ons", description = "Endpoints for on-site additional catalog add-on requests, admin approval, and payment settlement")
public class AdditionalAddOnController {

    private final AdditionalAddOnService additionalAddOnService;

    @PostMapping("/{bookingId}/additional-addons")
    @Operation(summary = "Washer requests an additional Catalog Add-on on-site")
    public ResponseEntity<ApiResponse<AdditionalAddOnRequest>> requestAddOn(
            @PathVariable("bookingId") String bookingId,
            @Valid @RequestBody AdditionalAddOnCreateRequest request) {
        String washerId = SecurityUtils.getRequiredCurrentUserId();
        AdditionalAddOnRequest created = additionalAddOnService.requestAdditionalAddOn(bookingId, washerId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Additional add-on request submitted for admin approval", CorrelationContext.getCorrelationId()));
    }

    @GetMapping("/{bookingId}/additional-addons")
    @Operation(summary = "List all additional add-on requests for a booking")
    public ResponseEntity<ApiResponse<List<AdditionalAddOnRequest>>> getRequests(@PathVariable("bookingId") String bookingId) {
        List<AdditionalAddOnRequest> list = additionalAddOnService.getRequestsByBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success(list, "Additional add-on requests retrieved", CorrelationContext.getCorrelationId()));
    }

    @PutMapping("/additional-addons/{requestId}/review")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Admin approves or rejects an additional add-on request")
    public ResponseEntity<ApiResponse<AdditionalAddOnRequest>> reviewRequest(
            @PathVariable("requestId") String requestId,
            @Valid @RequestBody AdditionalAddOnReviewRequest request) {
        String adminId = SecurityUtils.getRequiredCurrentUserId();
        AdditionalAddOnRequest reviewed = additionalAddOnService.reviewAdditionalAddOn(requestId, adminId, request);
        return ResponseEntity.ok(ApiResponse.success(reviewed, "Additional add-on review decision recorded", CorrelationContext.getCorrelationId()));
    }

    @PostMapping("/additional-addons/{requestId}/complete-payment")
    @Operation(summary = "Internal callback from Payment Service upon successful customer payment for add-on")
    public ResponseEntity<ApiResponse<Void>> completePayment(
            @PathVariable("requestId") String requestId,
            @RequestParam("paymentTransactionId") String paymentTransactionId) {
        additionalAddOnService.recordPaymentSuccess(requestId, paymentTransactionId);
        return ResponseEntity.ok(ApiResponse.success(null, "Additional add-on paid and dynamic checklist updated", CorrelationContext.getCorrelationId()));
    }
}
