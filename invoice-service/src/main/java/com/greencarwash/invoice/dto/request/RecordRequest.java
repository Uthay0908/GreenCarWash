package com.greencarwash.invoice.dto.request;

import jakarta.validation.constraints.NotBlank;

public record RecordRequest(@NotBlank String referenceId, String status, String description) {
}
