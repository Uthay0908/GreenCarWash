package com.greencarwash.assignment.dto;

import com.greencarwash.assignment.entity.AssignmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentResponse {

    private String id;
    private String bookingId;
    private String washerId;
    private String washerName;
    private AssignmentStatus status;
    private Integer etaMinutes;
    private String rejectionReason;
    private Instant assignedAt;
    private Instant respondedAt;
}
