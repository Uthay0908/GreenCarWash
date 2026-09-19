package com.greencarwash.catalog.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "package_tasks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackageTask {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    @JsonIgnore
    private WashPackage washPackage;

    @Column(nullable = false, length = 100)
    private String taskName;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private int sequenceOrder;

    @Builder.Default
    private boolean mandatory = true;
}
