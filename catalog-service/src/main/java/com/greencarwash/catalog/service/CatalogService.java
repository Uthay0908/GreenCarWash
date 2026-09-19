package com.greencarwash.catalog.service;

import com.greencarwash.catalog.dto.*;
import com.greencarwash.catalog.entity.*;
import com.greencarwash.catalog.repository.AddOnRepository;
import com.greencarwash.catalog.repository.WashPackageRepository;
import com.greencarwash.common.core.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CatalogService {

    private final WashPackageRepository washPackageRepository;
    private final AddOnRepository addOnRepository;

    @jakarta.annotation.PostConstruct
    @Transactional
    public void initDefaultData() {
        if (washPackageRepository.count() == 0) {
            log.info("Seeding default eco wash packages into Catalog DB...");
            WashPackage p1 = WashPackage.builder()
                    .name("Eco Waterless Polymer Wash")
                    .description("100% scratch-free bio-polymer lift with microfiber buffing. Saves 150+ liters of water.")
                    .price(new java.math.BigDecimal("49.99"))
                    .durationMinutes(30)
                    .waterAllocationLitres(new java.math.BigDecimal("2.50"))
                    .servicesCovered(List.of("Exterior Polymer Spray", "Microfiber Wipe", "Tire Dressing", "Window Polishing"))
                    .materials(List.of("Eco-Clean Bio Polymer", "3M Microfiber Cloths"))
                    .active(true)
                    .build();

            WashPackage p2 = WashPackage.builder()
                    .name("Hydro-Steam Express Clean")
                    .description("High-temperature pressurized steam for deep wheel wells, bugs, and glass sanitization.")
                    .price(new java.math.BigDecimal("79.99"))
                    .durationMinutes(45)
                    .waterAllocationLitres(new java.math.BigDecimal("5.00"))
                    .servicesCovered(List.of("Steam Sanitization", "Wheel Degreasing", "Hand Wax Sealant", "Door Jambs"))
                    .materials(List.of("Pressurized Dry Steam Unit", "Carnauba Wax Sealant"))
                    .active(true)
                    .build();

            WashPackage p3 = WashPackage.builder()
                    .name("Ceramic Shield & Eco Interior Detail")
                    .description("Comprehensive interior vacuum, dashboard UV polish, and exterior hydrophobic ceramic coat.")
                    .price(new java.math.BigDecimal("129.99"))
                    .durationMinutes(60)
                    .waterAllocationLitres(new java.math.BigDecimal("8.00"))
                    .servicesCovered(List.of("Interior HEPA Vacuum", "Dashboard UV Coating", "Ceramic Spray Sealant", "Leather Conditioning"))
                    .materials(List.of("9H Ceramic Spray", "Non-toxic Leather Balm"))
                    .active(true)
                    .build();

            washPackageRepository.saveAll(List.of(p1, p2, p3));
            log.info("Catalog packages seeded successfully.");
        }
    }

    @Transactional(readOnly = true)
    public List<WashPackageResponse> getActivePackages() {
        return washPackageRepository.findByActiveTrue()
                .stream()
                .map(this::mapToPackageResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WashPackageResponse getPackageById(String id) {
        WashPackage pkg = washPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wash Package", "id", id));
        return mapToPackageResponse(pkg);
    }

    @Transactional
    public WashPackageResponse createPackage(WashPackageRequest request) {
        WashPackage pkg = WashPackage.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .durationMinutes(request.getDurationMinutes())
                .waterAllocationLitres(request.getWaterAllocationLitres())
                .servicesCovered(request.getServicesCovered() != null ? request.getServicesCovered() : new ArrayList<>())
                .materials(request.getMaterials() != null ? request.getMaterials() : new ArrayList<>())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        if (request.getTasks() != null) {
            for (PackageTaskDto taskDto : request.getTasks()) {
                PackageTask task = PackageTask.builder()
                        .washPackage(pkg)
                        .taskName(taskDto.getTaskName())
                        .description(taskDto.getDescription())
                        .sequenceOrder(taskDto.getSequenceOrder())
                        .mandatory(taskDto.isMandatory())
                        .build();
                pkg.getTasks().add(task);
            }
        }

        pkg = washPackageRepository.save(pkg);
        log.info("Created wash package: id={}, name={}", pkg.getId(), pkg.getName());
        return mapToPackageResponse(pkg);
    }

    @Transactional
    public WashPackageResponse updatePackage(String id, WashPackageRequest request) {
        WashPackage pkg = washPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wash Package", "id", id));

        pkg.setName(request.getName());
        pkg.setDescription(request.getDescription());
        pkg.setPrice(request.getPrice());
        pkg.setDurationMinutes(request.getDurationMinutes());
        pkg.setWaterAllocationLitres(request.getWaterAllocationLitres());
        if (request.getServicesCovered() != null) pkg.setServicesCovered(request.getServicesCovered());
        if (request.getMaterials() != null) pkg.setMaterials(request.getMaterials());
        if (request.getActive() != null) pkg.setActive(request.getActive());

        if (request.getTasks() != null) {
            pkg.getTasks().clear();
            for (PackageTaskDto taskDto : request.getTasks()) {
                PackageTask task = PackageTask.builder()
                        .washPackage(pkg)
                        .taskName(taskDto.getTaskName())
                        .description(taskDto.getDescription())
                        .sequenceOrder(taskDto.getSequenceOrder())
                        .mandatory(taskDto.isMandatory())
                        .build();
                pkg.getTasks().add(task);
            }
        }

        pkg = washPackageRepository.save(pkg);
        log.info("Updated wash package: {}", id);
        return mapToPackageResponse(pkg);
    }

    @Transactional
    public void deactivatePackage(String id) {
        WashPackage pkg = washPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wash Package", "id", id));
        pkg.setActive(false);
        washPackageRepository.save(pkg);
        log.info("Deactivated wash package: {}", id);
    }

    @Transactional(readOnly = true)
    public List<AddOnResponse> getActiveAddOns() {
        return addOnRepository.findByActiveTrue()
                .stream()
                .map(this::mapToAddOnResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AddOnResponse getAddOnById(String id) {
        AddOn addOn = addOnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Add-on", "id", id));
        return mapToAddOnResponse(addOn);
    }

    @Transactional
    public AddOnResponse createAddOn(AddOnRequest request) {
        AddOn addOn = AddOn.builder()
                .name(request.getName())
                .description(request.getDescription())
                .fixedPrice(request.getFixedPrice())
                .waterAllocationLitres(request.getWaterAllocationLitres() != null ? request.getWaterAllocationLitres() : java.math.BigDecimal.ZERO)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        if (request.getTasks() != null) {
            for (AddOnTaskDto taskDto : request.getTasks()) {
                AddOnTask task = AddOnTask.builder()
                        .addOn(addOn)
                        .taskName(taskDto.getTaskName())
                        .description(taskDto.getDescription())
                        .sequenceOrder(taskDto.getSequenceOrder())
                        .mandatory(taskDto.isMandatory())
                        .build();
                addOn.getTasks().add(task);
            }
        }

        addOn = addOnRepository.save(addOn);
        log.info("Created add-on: id={}, name={}", addOn.getId(), addOn.getName());
        return mapToAddOnResponse(addOn);
    }

    @Transactional
    public AddOnResponse updateAddOn(String id, AddOnRequest request) {
        AddOn addOn = addOnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Add-on", "id", id));

        addOn.setName(request.getName());
        addOn.setDescription(request.getDescription());
        addOn.setFixedPrice(request.getFixedPrice());
        if (request.getWaterAllocationLitres() != null) addOn.setWaterAllocationLitres(request.getWaterAllocationLitres());
        if (request.getActive() != null) addOn.setActive(request.getActive());

        if (request.getTasks() != null) {
            addOn.getTasks().clear();
            for (AddOnTaskDto taskDto : request.getTasks()) {
                AddOnTask task = AddOnTask.builder()
                        .addOn(addOn)
                        .taskName(taskDto.getTaskName())
                        .description(taskDto.getDescription())
                        .sequenceOrder(taskDto.getSequenceOrder())
                        .mandatory(taskDto.isMandatory())
                        .build();
                addOn.getTasks().add(task);
            }
        }

        addOn = addOnRepository.save(addOn);
        log.info("Updated add-on: {}", id);
        return mapToAddOnResponse(addOn);
    }

    @Transactional
    public void deactivateAddOn(String id) {
        AddOn addOn = addOnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Add-on", "id", id));
        addOn.setActive(false);
        addOnRepository.save(addOn);
        log.info("Deactivated add-on: {}", id);
    }

    private WashPackageResponse mapToPackageResponse(WashPackage p) {
        List<PackageTaskDto> taskDtos = p.getTasks().stream()
                .map(t -> PackageTaskDto.builder()
                        .id(t.getId())
                        .taskName(t.getTaskName())
                        .description(t.getDescription())
                        .sequenceOrder(t.getSequenceOrder())
                        .mandatory(t.isMandatory())
                        .build())
                .collect(Collectors.toList());

        return WashPackageResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .durationMinutes(p.getDurationMinutes())
                .waterAllocationLitres(p.getWaterAllocationLitres())
                .tasks(taskDtos)
                .servicesCovered(p.getServicesCovered())
                .materials(p.getMaterials())
                .active(p.isActive())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private AddOnResponse mapToAddOnResponse(AddOn a) {
        List<AddOnTaskDto> taskDtos = a.getTasks().stream()
                .map(t -> AddOnTaskDto.builder()
                        .id(t.getId())
                        .taskName(t.getTaskName())
                        .description(t.getDescription())
                        .sequenceOrder(t.getSequenceOrder())
                        .mandatory(t.isMandatory())
                        .build())
                .collect(Collectors.toList());

        return AddOnResponse.builder()
                .id(a.getId())
                .name(a.getName())
                .description(a.getDescription())
                .fixedPrice(a.getFixedPrice())
                .waterAllocationLitres(a.getWaterAllocationLitres())
                .tasks(taskDtos)
                .active(a.isActive())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
