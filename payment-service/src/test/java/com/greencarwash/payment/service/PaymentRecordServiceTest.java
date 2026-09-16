package com.greencarwash.payment.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import static org.mockito.ArgumentMatchers.any;

import static org.mockito.Mockito.when;

import com.greencarwash.payment.dto.request.RecordRequest;

import com.greencarwash.payment.entity.PaymentRecord;

import com.greencarwash.payment.repository.PaymentRecordRepository;

import org.junit.jupiter.api.Test;

import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;

import org.mockito.Mock;

import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PaymentRecordServiceTest {
    @Mock
    private PaymentRecordRepository repository;

    @InjectMocks
    private PaymentRecordService service;

    @Test
    void shouldCreateRecord() {
        PaymentRecord entity = new PaymentRecord();
        entity.setId(1L); entity.setReferenceId("TEST-1"); entity.setStatus("PENDING");
        when(repository.save(any(PaymentRecord.class))).thenReturn(entity);
        var response = service.create(new RecordRequest("TEST-1", "PENDING", "test"));
        assertEquals("TEST-1", response.referenceId());
    }
}
