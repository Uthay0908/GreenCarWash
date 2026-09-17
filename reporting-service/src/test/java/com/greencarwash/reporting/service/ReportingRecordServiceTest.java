package com.greencarwash.reporting.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import static org.mockito.ArgumentMatchers.any;

import static org.mockito.Mockito.when;

import com.greencarwash.reporting.dto.request.RecordRequest;

import com.greencarwash.reporting.entity.ReportingRecord;

import com.greencarwash.reporting.repository.ReportingRecordRepository;

import org.junit.jupiter.api.Test;

import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;

import org.mockito.Mock;

import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReportingRecordServiceTest {
    @Mock
    private ReportingRecordRepository repository;

    @InjectMocks
    private ReportingRecordService service;

    @Test
    void shouldCreateRecord() {
        ReportingRecord entity = new ReportingRecord();
        entity.setId(1L); entity.setReferenceId("TEST-1"); entity.setStatus("PENDING");
        when(repository.save(any(ReportingRecord.class))).thenReturn(entity);
        var response = service.create(new RecordRequest("TEST-1", "PENDING", "test"));
        assertEquals("TEST-1", response.referenceId());
    }
}
