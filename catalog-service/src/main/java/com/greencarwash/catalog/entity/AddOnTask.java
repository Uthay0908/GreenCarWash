package com.greencarwash.catalog.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "addon_tasks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddOnTask {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "addon_id", nullable = false)
    @JsonIgnore
    private AddOn addOn;

    @Column(nullable = false, length = 100)
    private String taskName;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private int sequenceOrder;

    @Builder.Default
    private boolean mandatory = true;
}
