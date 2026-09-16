package com.greencarwash.vehicle.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import static org.mockito.ArgumentMatchers.any;

import static org.mockito.Mockito.when;

import com.greencarwash.vehicle.dto.request.RecordRequest;

import com.greencarwash.vehicle.entity.VehicleRecord;

import com.greencarwash.vehicle.repository.VehicleRecordRepository;

import org.junit.jupiter.api.Test;

import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;

import org.mockito.Mock;

import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class VehicleRecordServiceTest {
    @Mock
    private VehicleRecordRepository repository;

    @InjectMocks
    private VehicleRecordService service;

    @Test
    void shouldCreateRecord() {
        VehicleRecord entity = new VehicleRecord();
        entity.setId(1L); entity.setReferenceId("TEST-1"); entity.setStatus("PENDING");
        when(repository.save(any(VehicleRecord.class))).thenReturn(entity);
        var response = service.create(new RecordRequest("TEST-1", "PENDING", "test"));
        assertEquals("TEST-1", response.referenceId());
    }
}
