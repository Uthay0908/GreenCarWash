package com.greencarwash.booking.dto;

import com.greencarwash.booking.entity.ChecklistSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistItemDto {
    private String id;
    private String taskId;
    private String taskName;
    private String description;
    private int sequenceOrder;
    private boolean mandatory;
    private boolean completed;
    private Instant completedAt;
    private ChecklistSource source;
}
