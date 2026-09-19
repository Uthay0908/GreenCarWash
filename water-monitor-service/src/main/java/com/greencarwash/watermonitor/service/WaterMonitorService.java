package com.greencarwash.watermonitor.service;

import com.greencarwash.common.core.exception.BusinessException;
import com.greencarwash.common.core.exception.ResourceNotFoundException;
import com.greencarwash.common.events.RabbitMQConstants;
import com.greencarwash.common.events.model.WaterEvents;
import com.greencarwash.watermonitor.dto.*;
import com.greencarwash.watermonitor.entity.WashMethod;
import com.greencarwash.watermonitor.entity.WaterBenchmarkConfig;
import com.greencarwash.watermonitor.entity.WaterSavingRecord;
import com.greencarwash.watermonitor.repository.WaterBenchmarkConfigRepository;
import com.greencarwash.watermonitor.repository.WaterSavingRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WaterMonitorService {

    public static final BigDecimal LITRES_PER_GALLON = BigDecimal.valueOf(3.78541);
    public static final BigDecimal LITRES_PER_BATHTUB = BigDecimal.valueOf(150.00);

    private final WaterSavingRecordRepository waterRecordRepository;
    private final WaterBenchmarkConfigRepository benchmarkRepository;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public WaterRecordResponse recordWaterUsage(WaterRecordRequest request) {
        if (waterRecordRepository.findByBookingId(request.getBookingId()).isPresent()) {
            throw new BusinessException("Water usage already recorded for booking: " + request.getBookingId());
        }

        BigDecimal allocated = request.getAllocatedLitres();
        BigDecimal actual = request.getActualUsedLitres();
        BigDecimal savedLitres = allocated.subtract(actual).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        BigDecimal savedGallons = savedLitres.divide(LITRES_PER_GALLON, 2, RoundingMode.HALF_UP);

        WaterSavingRecord record = WaterSavingRecord.builder()
                .bookingId(request.getBookingId())
                .customerId(request.getCustomerId())
                .customerName(request.getCustomerName() != null ? request.getCustomerName() : "Valued Customer")
                .washerId(request.getWasherId())
                .washMethod(request.getWashMethod() != null ? request.getWashMethod() : WashMethod.LOW_WATER_PRESSURE)
                .allocatedLitres(allocated)
                .actualUsedLitres(actual)
                .savedLitres(savedLitres)
                .savedGallons(savedGallons)
                .recordedAt(Instant.now())
                .notes(request.getNotes())
                .build();

        WaterSavingRecord saved = waterRecordRepository.save(record);
        log.info("Recorded water usage for booking {}: saved {}L ({} gal)",
                saved.getBookingId(), saved.getSavedLitres(), saved.getSavedGallons());

        // Publish events
        publishWaterEvents(saved);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public WaterSavingsSummaryResponse getCustomerSavings(String customerId) {
        BigDecimal totalLitres = waterRecordRepository.sumSavedLitresByCustomerId(customerId);
        BigDecimal totalGallons = waterRecordRepository.sumSavedGallonsByCustomerId(customerId);
        long totalWashes = waterRecordRepository.countByCustomerId(customerId);
        List<WaterSavingRecord> records = waterRecordRepository.findByCustomerIdOrderByRecordedAtDesc(customerId);

        String customerName = records.isEmpty() ? "Customer" : records.get(0).getCustomerName();

        return WaterSavingsSummaryResponse.builder()
                .customerId(customerId)
                .customerName(customerName)
                .totalLitresSaved(totalLitres.setScale(2, RoundingMode.HALF_UP))
                .totalGallonsSaved(totalGallons.setScale(2, RoundingMode.HALF_UP))
                .totalWashes(totalWashes)
                .recentRecords(records.stream().limit(10).map(this::mapToResponse).toList())
                .build();
    }

    @Transactional(readOnly = true)
    public GlobalWaterStatsResponse getGlobalStats() {
        BigDecimal totalLitres = waterRecordRepository.sumAllSavedLitres().setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalGallons = waterRecordRepository.sumAllSavedGallons().setScale(2, RoundingMode.HALF_UP);
        long totalWashes = waterRecordRepository.count();
        long bathtubs = totalLitres.divide(LITRES_PER_BATHTUB, 0, RoundingMode.HALF_UP).longValue();

        return GlobalWaterStatsResponse.builder()
                .totalLitresSaved(totalLitres)
                .totalGallonsSaved(totalGallons)
                .totalWashesCompleted(totalWashes)
                .equivalentBathtubsSaved(bathtubs)
                .build();
    }

    // Benchmark Management
    @Transactional(readOnly = true)
    public List<WaterBenchmarkDto> getAllBenchmarks() {
        return benchmarkRepository.findAll().stream()
                .map(this::mapBenchmarkToDto)
                .toList();
    }

    @Transactional
    public WaterBenchmarkDto upsertBenchmark(WaterBenchmarkDto dto) {
        WaterBenchmarkConfig config = benchmarkRepository.findByVehicleSizeIgnoreCase(dto.getVehicleSize())
                .orElse(WaterBenchmarkConfig.builder().vehicleSize(dto.getVehicleSize().toUpperCase()).build());

        config.setTraditionalBaselineLitres(dto.getTraditionalBaselineLitres());
        if (dto.getLowWaterBaselineLitres() != null) config.setLowWaterBaselineLitres(dto.getLowWaterBaselineLitres());
        if (dto.getSteamBaselineLitres() != null) config.setSteamBaselineLitres(dto.getSteamBaselineLitres());
        if (dto.getWaterlessBaselineLitres() != null) config.setWaterlessBaselineLitres(dto.getWaterlessBaselineLitres());
        if (dto.getEcoPressureBaselineLitres() != null) config.setEcoPressureBaselineLitres(dto.getEcoPressureBaselineLitres());

        WaterBenchmarkConfig saved = benchmarkRepository.save(config);
        return mapBenchmarkToDto(saved);
    }

    private void publishWaterEvents(WaterSavingRecord record) {
        try {
            WaterEvents.WaterUsageRecordedEvent usageEvent = WaterEvents.WaterUsageRecordedEvent.builder()
                    .recordId(record.getId())
                    .bookingId(record.getBookingId())
                    .customerId(record.getCustomerId())
                    .washerId(record.getWasherId())
                    .washMethod(record.getWashMethod().name())
                    .allocatedLitres(record.getAllocatedLitres())
                    .actualUsedLitres(record.getActualUsedLitres())
                    .savedLitres(record.getSavedLitres())
                    .savedGallons(record.getSavedGallons())
                    .build();

            rabbitTemplate.convertAndSend(
                    RabbitMQConstants.WATER_EXCHANGE,
                    RabbitMQConstants.RK_WATER_USAGE_RECORDED,
                    usageEvent
            );

            BigDecimal customerTotalLitres = waterRecordRepository.sumSavedLitresByCustomerId(record.getCustomerId());
            BigDecimal customerTotalGallons = waterRecordRepository.sumSavedGallonsByCustomerId(record.getCustomerId());
            long totalWashes = waterRecordRepository.countByCustomerId(record.getCustomerId());

            WaterEvents.WaterSavingRecordedEvent savingEvent = WaterEvents.WaterSavingRecordedEvent.builder()
                    .customerId(record.getCustomerId())
                    .customerName(record.getCustomerName())
                    .totalLitresSaved(customerTotalLitres)
                    .totalGallonsSaved(customerTotalGallons)
                    .totalWashes((int) totalWashes)
                    .build();

            rabbitTemplate.convertAndSend(
                    RabbitMQConstants.WATER_EXCHANGE,
                    RabbitMQConstants.RK_WATER_SAVING_RECORDED,
                    savingEvent
            );
        } catch (Exception e) {
            log.warn("Failed to publish water events for booking {}: {}", record.getBookingId(), e.getMessage());
        }
    }

    public WaterRecordResponse mapToResponse(WaterSavingRecord r) {
        return WaterRecordResponse.builder()
                .id(r.getId())
                .bookingId(r.getBookingId())
                .customerId(r.getCustomerId())
                .customerName(r.getCustomerName())
                .washerId(r.getWasherId())
                .washMethod(r.getWashMethod())
                .allocatedLitres(r.getAllocatedLitres())
                .actualUsedLitres(r.getActualUsedLitres())
                .savedLitres(r.getSavedLitres())
                .savedGallons(r.getSavedGallons())
                .recordedAt(r.getRecordedAt())
                .notes(r.getNotes())
                .build();
    }

    private WaterBenchmarkDto mapBenchmarkToDto(WaterBenchmarkConfig c) {
        return WaterBenchmarkDto.builder()
                .id(c.getId())
                .vehicleSize(c.getVehicleSize())
                .traditionalBaselineLitres(c.getTraditionalBaselineLitres())
                .lowWaterBaselineLitres(c.getLowWaterBaselineLitres())
                .steamBaselineLitres(c.getSteamBaselineLitres())
                .waterlessBaselineLitres(c.getWaterlessBaselineLitres())
                .ecoPressureBaselineLitres(c.getEcoPressureBaselineLitres())
                .build();
    }
}
