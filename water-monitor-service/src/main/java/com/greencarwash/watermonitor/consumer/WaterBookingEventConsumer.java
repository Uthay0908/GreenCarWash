package com.greencarwash.watermonitor.consumer;

import com.greencarwash.common.events.RabbitMQConstants;
import com.greencarwash.common.events.model.BookingEvents;
import com.greencarwash.watermonitor.dto.WaterRecordRequest;
import com.greencarwash.watermonitor.entity.WashMethod;
import com.greencarwash.watermonitor.repository.WaterSavingRecordRepository;
import com.greencarwash.watermonitor.service.WaterMonitorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class WaterBookingEventConsumer {

    private final WaterMonitorService waterMonitorService;
    private final WaterSavingRecordRepository waterRecordRepository;

    @RabbitListener(queues = RabbitMQConstants.WATER_QUEUE)
    public void handleServiceCompleted(BookingEvents.ServiceCompletedEvent event) {
        log.info("Received ServiceCompletedEvent for booking: {}", event.getBookingId());

        if (waterRecordRepository.findByBookingId(event.getBookingId()).isPresent()) {
            log.info("Water record already exists for booking: {}", event.getBookingId());
            return;
        }

        try {
            BigDecimal allocated = BigDecimal.valueOf(150.00);
            BigDecimal actualUsed = event.getActualWaterUsedLitres() != null ?
                    event.getActualWaterUsedLitres() : BigDecimal.valueOf(25.00);

            WaterRecordRequest request = WaterRecordRequest.builder()
                    .bookingId(event.getBookingId())
                    .customerId(event.getCustomerId())
                    .customerName("Eco Customer")
                    .washerId(event.getWasherId())
                    .washMethod(WashMethod.LOW_WATER_PRESSURE)
                    .allocatedLitres(allocated)
                    .actualUsedLitres(actualUsed)
                    .notes("Auto-recorded upon service completion event")
                    .build();

            waterMonitorService.recordWaterUsage(request);
            log.info("Auto-recorded water usage for booking {}", event.getBookingId());
        } catch (Exception e) {
            log.warn("Failed to auto-record water usage for booking {}: {}", event.getBookingId(), e.getMessage());
        }
    }
}
