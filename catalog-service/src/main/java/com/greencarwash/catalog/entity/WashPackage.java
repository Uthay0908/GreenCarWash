package com.greencarwash.catalog.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wash_packages", indexes = {
        @Index(name = "idx_pkg_active", columnList = "active")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WashPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private int durationMinutes;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal waterAllocationLitres;

    @OneToMany(mappedBy = "washPackage", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("sequenceOrder ASC")
    @Builder.Default
    private List<PackageTask> tasks = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "package_services_covered", joinColumns = @JoinColumn(name = "package_id"))
    @Column(name = "service_covered")
    @Builder.Default
    private List<String> servicesCovered = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "package_materials", joinColumns = @JoinColumn(name = "package_id"))
    @Column(name = "material")
    @Builder.Default
    private List<String> materials = new ArrayList<>();

    @Builder.Default
    private boolean active = true;

    @Version
    private Long version;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
