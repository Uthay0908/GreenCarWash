package com.greencarwash.assignment.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "washer_locations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WasherLocation {

    @Id
    private String washerId;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Builder.Default
    private boolean isOnline = true;

    @UpdateTimestamp
    private Instant updatedAt;
}
