package com.greencarwash.watermonitor.service;

import com.greencarwash.watermonitor.dto.WaterRecordRequest;
import com.greencarwash.watermonitor.dto.WaterRecordResponse;
import com.greencarwash.watermonitor.entity.WashMethod;
import com.greencarwash.watermonitor.entity.WaterSavingRecord;
import com.greencarwash.watermonitor.repository.WaterBenchmarkConfigRepository;
import com.greencarwash.watermonitor.repository.WaterSavingRecordRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WaterCalculationTest {

    @Mock
    private WaterSavingRecordRepository waterRecordRepository;

    @Mock
    private WaterBenchmarkConfigRepository benchmarkRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private WaterMonitorService waterMonitorService;

    @Test
    @DisplayName("Verify precise water savings calculation and US gallon conversion")
    void testWaterSavingsAndGallonConversion() {
        when(waterRecordRepository.findByBookingId("BKG-101")).thenReturn(Optional.empty());
        when(waterRecordRepository.save(any(WaterSavingRecord.class))).thenAnswer(inv -> inv.getArgument(0));

        // Allocated 150L, Actual used 25L -> Saved 125L
        // 125 / 3.78541 = 33.0210... -> 33.02 gallons
        WaterRecordRequest request = WaterRecordRequest.builder()
                .bookingId("BKG-101")
                .customerId("CUST-1")
                .customerName("Eco Hero")
                .washerId("WSH-1")
                .washMethod(WashMethod.LOW_WATER_PRESSURE)
                .allocatedLitres(BigDecimal.valueOf(150.00))
                .actualUsedLitres(BigDecimal.valueOf(25.00))
                .build();

        WaterRecordResponse response = waterMonitorService.recordWaterUsage(request);

        assertNotNull(response);
        assertEquals(0, new BigDecimal("125.00").compareTo(response.getSavedLitres()));
        assertEquals(0, new BigDecimal("33.02").compareTo(response.getSavedGallons()));
    }

    @Test
    @DisplayName("Verify water savings cannot be negative if actual exceeds allocated")
    void testNegativeSavingsCappedAtZero() {
        when(waterRecordRepository.findByBookingId("BKG-102")).thenReturn(Optional.empty());
        when(waterRecordRepository.save(any(WaterSavingRecord.class))).thenAnswer(inv -> inv.getArgument(0));

        // Allocated 40L, Actual used 50L -> Saved = 0 (not negative)
        WaterRecordRequest request = WaterRecordRequest.builder()
                .bookingId("BKG-102")
                .customerId("CUST-2")
                .customerName("Water Consumer")
                .washerId("WSH-2")
                .washMethod(WashMethod.LOW_WATER_PRESSURE)
                .allocatedLitres(BigDecimal.valueOf(40.00))
                .actualUsedLitres(BigDecimal.valueOf(50.00))
                .build();

        WaterRecordResponse response = waterMonitorService.recordWaterUsage(request);

        assertNotNull(response);
        assertEquals(0, BigDecimal.ZERO.compareTo(response.getSavedLitres()));
        assertEquals(0, BigDecimal.ZERO.compareTo(response.getSavedGallons()));
    }
}
