package com.greencarwash.invoice.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import static org.mockito.ArgumentMatchers.any;

import static org.mockito.Mockito.when;

import com.greencarwash.invoice.dto.request.RecordRequest;

import com.greencarwash.invoice.entity.InvoiceRecord;

import com.greencarwash.invoice.repository.InvoiceRecordRepository;

import org.junit.jupiter.api.Test;

import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;

import org.mockito.Mock;

import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InvoiceRecordServiceTest {
    @Mock
    private InvoiceRecordRepository repository;

    @InjectMocks
    private InvoiceRecordService service;

    @Test
    void shouldCreateRecord() {
        InvoiceRecord entity = new InvoiceRecord();
        entity.setId(1L); entity.setReferenceId("TEST-1"); entity.setStatus("PENDING");
        when(repository.save(any(InvoiceRecord.class))).thenReturn(entity);
        var response = service.create(new RecordRequest("TEST-1", "PENDING", "test"));
        assertEquals("TEST-1", response.referenceId());
    }
}
