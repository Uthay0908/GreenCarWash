package com.greencarwash.invoice.dto.response;

import java.time.Instant;

public record RecordResponse(Long id, String referenceId, String status, String description, Instant createdAt) {
}
