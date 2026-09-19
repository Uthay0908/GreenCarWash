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
@Table(name = "catalog_addons", indexes = {
        @Index(name = "idx_addon_active", columnList = "active")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddOn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal fixedPrice;

    @Builder.Default
    @Column(precision = 10, scale = 2)
    private BigDecimal waterAllocationLitres = BigDecimal.ZERO;

    @OneToMany(mappedBy = "addOn", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("sequenceOrder ASC")
    @Builder.Default
    private List<AddOnTask> tasks = new ArrayList<>();

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
