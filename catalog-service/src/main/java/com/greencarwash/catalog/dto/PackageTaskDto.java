package com.greencarwash.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackageTaskDto {
    private String id;

    @NotBlank(message = "Task name is required")
    private String taskName;

    private String description;
    private int sequenceOrder;
    private boolean mandatory;
}
