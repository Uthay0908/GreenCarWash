package com.greencarwash.catalog.controller;

import com.greencarwash.catalog.dto.AddOnResponse;
import com.greencarwash.catalog.dto.PromotionResponse;
import com.greencarwash.catalog.dto.WashPackageResponse;
import com.greencarwash.catalog.service.CatalogService;
import com.greencarwash.catalog.service.PromotionService;
import com.greencarwash.common.core.dto.ApiResponse;
import com.greencarwash.common.core.util.CorrelationContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
@Tag(name = "Catalog", description = "Public & Customer endpoints for wash packages, tasks, materials, add-ons, and promotions")
public class CatalogController {

    private final CatalogService catalogService;
    private final PromotionService promotionService;

    @GetMapping("/packages")
    @Operation(summary = "List all active wash packages")
    public ResponseEntity<ApiResponse<List<WashPackageResponse>>> getActivePackages() {
        List<WashPackageResponse> packages = catalogService.getActivePackages();
        return ResponseEntity.ok(ApiResponse.success(packages, "Active packages retrieved", CorrelationContext.getCorrelationId()));
    }

    @GetMapping("/packages/{id}")
    @Operation(summary = "Get detailed package info including tasks, materials, and water allocation")
    public ResponseEntity<ApiResponse<WashPackageResponse>> getPackageById(@PathVariable("id") String id) {
        WashPackageResponse pkg = catalogService.getPackageById(id);
        return ResponseEntity.ok(ApiResponse.success(pkg, "Package details retrieved", CorrelationContext.getCorrelationId()));
    }

    @GetMapping("/add-ons")
    @Operation(summary = "List all active add-ons with fixed prices")
    public ResponseEntity<ApiResponse<List<AddOnResponse>>> getActiveAddOns() {
        List<AddOnResponse> addOns = catalogService.getActiveAddOns();
        return ResponseEntity.ok(ApiResponse.success(addOns, "Active add-ons retrieved", CorrelationContext.getCorrelationId()));
    }

    @GetMapping("/add-ons/{id}")
    @Operation(summary = "Get add-on details by ID")
    public ResponseEntity<ApiResponse<AddOnResponse>> getAddOnById(@PathVariable("id") String id) {
        AddOnResponse addOn = catalogService.getAddOnById(id);
        return ResponseEntity.ok(ApiResponse.success(addOn, "Add-on details retrieved", CorrelationContext.getCorrelationId()));
    }

    @GetMapping("/promotions/{code}")
    @Operation(summary = "Validate and get promotion details by code")
    public ResponseEntity<ApiResponse<PromotionResponse>> getPromotion(@PathVariable("code") String code) {
        PromotionResponse promo = promotionService.getValidPromotion(code);
        return ResponseEntity.ok(ApiResponse.success(promo, "Promotion valid", CorrelationContext.getCorrelationId()));
    }
}
