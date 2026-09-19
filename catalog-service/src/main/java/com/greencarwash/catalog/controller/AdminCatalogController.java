package com.greencarwash.catalog.controller;

import com.greencarwash.catalog.dto.*;
import com.greencarwash.catalog.service.CatalogService;
import com.greencarwash.catalog.service.PromotionService;
import com.greencarwash.common.core.dto.ApiResponse;
import com.greencarwash.common.core.util.CorrelationContext;
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
@RequestMapping("/api/catalog/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@Tag(name = "Admin Catalog Management", description = "Admin endpoints for managing packages, add-ons, water allocations, and promotional campaigns")
public class AdminCatalogController {

    private final CatalogService catalogService;
    private final PromotionService promotionService;

    @PostMapping("/packages")
    @Operation(summary = "Create a new wash package (Admin only)")
    public ResponseEntity<ApiResponse<WashPackageResponse>> createPackage(@Valid @RequestBody WashPackageRequest request) {
        WashPackageResponse response = catalogService.createPackage(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Wash package created successfully", CorrelationContext.getCorrelationId()));
    }

    @PutMapping("/packages/{id}")
    @Operation(summary = "Update an existing wash package (Admin only)")
    public ResponseEntity<ApiResponse<WashPackageResponse>> updatePackage(
            @PathVariable("id") String id,
            @Valid @RequestBody WashPackageRequest request) {
        WashPackageResponse response = catalogService.updatePackage(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Wash package updated successfully", CorrelationContext.getCorrelationId()));
    }

    @DeleteMapping("/packages/{id}")
    @Operation(summary = "Deactivate a wash package (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deactivatePackage(@PathVariable("id") String id) {
        catalogService.deactivatePackage(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Wash package deactivated", CorrelationContext.getCorrelationId()));
    }

    @PostMapping("/add-ons")
    @Operation(summary = "Create a new add-on service (Admin only)")
    public ResponseEntity<ApiResponse<AddOnResponse>> createAddOn(@Valid @RequestBody AddOnRequest request) {
        AddOnResponse response = catalogService.createAddOn(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Add-on created successfully", CorrelationContext.getCorrelationId()));
    }

    @PutMapping("/add-ons/{id}")
    @Operation(summary = "Update an existing add-on service (Admin only)")
    public ResponseEntity<ApiResponse<AddOnResponse>> updateAddOn(
            @PathVariable("id") String id,
            @Valid @RequestBody AddOnRequest request) {
        AddOnResponse response = catalogService.updateAddOn(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Add-on updated successfully", CorrelationContext.getCorrelationId()));
    }

    @DeleteMapping("/add-ons/{id}")
    @Operation(summary = "Deactivate an add-on service (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deactivateAddOn(@PathVariable("id") String id) {
        catalogService.deactivateAddOn(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Add-on deactivated", CorrelationContext.getCorrelationId()));
    }

    @GetMapping("/promotions")
    @Operation(summary = "List all promotions (Admin only)")
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getAllPromotions() {
        List<PromotionResponse> promotions = promotionService.getAllPromotions();
        return ResponseEntity.ok(ApiResponse.success(promotions, "Promotions retrieved", CorrelationContext.getCorrelationId()));
    }

    @PostMapping("/promotions")
    @Operation(summary = "Create a new promotion (Admin only)")
    public ResponseEntity<ApiResponse<PromotionResponse>> createPromotion(@Valid @RequestBody PromotionRequest request) {
        PromotionResponse response = promotionService.createPromotion(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Promotion created successfully", CorrelationContext.getCorrelationId()));
    }

    @DeleteMapping("/promotions/{id}")
    @Operation(summary = "Deactivate a promotion (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deactivatePromotion(@PathVariable("id") String id) {
        promotionService.deactivatePromotion(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Promotion deactivated", CorrelationContext.getCorrelationId()));
    }
}
