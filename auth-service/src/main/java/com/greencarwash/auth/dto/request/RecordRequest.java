package com.greencarwash.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

public record RecordRequest(@NotBlank String referenceId, String status, String description) {
}
