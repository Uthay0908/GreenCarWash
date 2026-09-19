package com.greencarwash.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings", indexes = {
        @Index(name = "idx_booking_num", columnList = "bookingNumber", unique = true),
        @Index(name = "idx_booking_customer", columnList = "customerId"),
        @Index(name = "idx_booking_washer", columnList = "washerId"),
        @Index(name = "idx_booking_status", columnList = "status"),
        @Index(name = "idx_booking_created", columnList = "createdAt")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 50)
    private String bookingNumber;

    @Column(nullable = false)
    private String customerId;

    private String customerEmail;
    private String customerName;

    @Column(nullable = false)
    private String vehicleId;

    @Column(nullable = false)
    private String packageId;

    @Column(nullable = false, length = 100)
    private String packageName;

    @Column(nullable = false, length = 255)
    private String serviceAddress;

    private Double latitude;
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private BookingMode bookingMode = BookingMode.WASH_NOW;

    private Instant scheduledTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private BookingStatus status = BookingStatus.CREATED;

    private String washerId;
    private String washerName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal allocatedWaterLitres;

    @Column(precision = 10, scale = 2)
    private BigDecimal actualWaterUsedLitres;

    private String washMethod;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BookingAddOn> addOns = new ArrayList<>();

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sequenceOrder ASC")
    @Builder.Default
    private List<ChecklistItem> checklist = new ArrayList<>();

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AdditionalAddOnRequest> additionalAddOnRequests = new ArrayList<>();

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("timestamp ASC")
    @Builder.Default
    private List<BookingStatusHistory> statusHistory = new ArrayList<>();

    @Version
    private Long version;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
