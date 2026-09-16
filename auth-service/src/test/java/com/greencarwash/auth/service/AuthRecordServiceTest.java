package com.greencarwash.auth.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import static org.mockito.ArgumentMatchers.any;

import static org.mockito.Mockito.when;

import com.greencarwash.auth.dto.request.RecordRequest;

import com.greencarwash.auth.entity.AuthRecord;

import com.greencarwash.auth.repository.AuthRecordRepository;

import org.junit.jupiter.api.Test;

import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;

import org.mockito.Mock;

import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuthRecordServiceTest {
    @Mock
    private AuthRecordRepository repository;

    @InjectMocks
    private AuthRecordService service;

    @Test
    void shouldCreateRecord() {
        AuthRecord entity = new AuthRecord();
        entity.setId(1L); entity.setReferenceId("TEST-1"); entity.setStatus("PENDING");
        when(repository.save(any(AuthRecord.class))).thenReturn(entity);
        var response = service.create(new RecordRequest("TEST-1", "PENDING", "test"));
        assertEquals("TEST-1", response.referenceId());
    }
}
