package com.greencarwash.loyalty.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import static org.mockito.ArgumentMatchers.any;

import static org.mockito.Mockito.when;

import com.greencarwash.loyalty.dto.request.RecordRequest;

import com.greencarwash.loyalty.entity.LoyaltyRecord;

import com.greencarwash.loyalty.repository.LoyaltyRecordRepository;

import org.junit.jupiter.api.Test;

import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;

import org.mockito.Mock;

import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class LoyaltyRecordServiceTest {
    @Mock
    private LoyaltyRecordRepository repository;

    @InjectMocks
    private LoyaltyRecordService service;

    @Test
    void shouldCreateRecord() {
        LoyaltyRecord entity = new LoyaltyRecord();
        entity.setId(1L); entity.setReferenceId("TEST-1"); entity.setStatus("PENDING");
        when(repository.save(any(LoyaltyRecord.class))).thenReturn(entity);
        var response = service.create(new RecordRequest("TEST-1", "PENDING", "test"));
        assertEquals("TEST-1", response.referenceId());
    }
}
