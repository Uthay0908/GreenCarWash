package com.greencarwash.catalog.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import static org.mockito.ArgumentMatchers.any;

import static org.mockito.Mockito.when;

import com.greencarwash.catalog.dto.request.RecordRequest;

import com.greencarwash.catalog.entity.CatalogRecord;

import com.greencarwash.catalog.repository.CatalogRecordRepository;

import org.junit.jupiter.api.Test;

import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;

import org.mockito.Mock;

import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CatalogRecordServiceTest {
    @Mock
    private CatalogRecordRepository repository;

    @InjectMocks
    private CatalogRecordService service;

    @Test
    void shouldCreateRecord() {
        CatalogRecord entity = new CatalogRecord();
        entity.setId(1L); entity.setReferenceId("TEST-1"); entity.setStatus("PENDING");
        when(repository.save(any(CatalogRecord.class))).thenReturn(entity);
        var response = service.create(new RecordRequest("TEST-1", "PENDING", "test"));
        assertEquals("TEST-1", response.referenceId());
    }
}
