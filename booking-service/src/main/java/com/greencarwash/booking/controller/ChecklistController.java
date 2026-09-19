package com.greencarwash.booking.controller;

import com.greencarwash.booking.dto.ChecklistItemDto;
import com.greencarwash.booking.service.ChecklistService;
import com.greencarwash.common.core.dto.ApiResponse;
import com.greencarwash.common.core.util.CorrelationContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings/{bookingId}/checklist")
@RequiredArgsConstructor
@Tag(name = "Booking Checklist", description = "Endpoints for inspecting and updating dynamic wash checklist progress")
public class ChecklistController {

    private final ChecklistService checklistService;

    @GetMapping
    @Operation(summary = "Get the dynamic checklist for a booking")
    public ResponseEntity<ApiResponse<List<ChecklistItemDto>>> getChecklist(@PathVariable("bookingId") String bookingId) {
        List<ChecklistItemDto> checklist = checklistService.getChecklist(bookingId);
        return ResponseEntity.ok(ApiResponse.success(checklist, "Checklist retrieved", CorrelationContext.getCorrelationId()));
    }

    @PatchMapping("/{itemId}")
    @Operation(summary = "Mark a checklist task as completed or incomplete (Washer operation)")
    public ResponseEntity<ApiResponse<ChecklistItemDto>> markTask(
            @PathVariable("bookingId") String bookingId,
            @PathVariable("itemId") String itemId,
            @RequestParam("completed") boolean completed) {
        ChecklistItemDto item = checklistService.markTask(bookingId, itemId, completed);
        return ResponseEntity.ok(ApiResponse.success(item, "Checklist task status updated", CorrelationContext.getCorrelationId()));
    }
}
