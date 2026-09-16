package com.greencarwash.user.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import static org.mockito.ArgumentMatchers.any;

import static org.mockito.Mockito.when;

import com.greencarwash.user.dto.request.RecordRequest;

import com.greencarwash.user.entity.UserRecord;

import com.greencarwash.user.repository.UserRecordRepository;

import org.junit.jupiter.api.Test;

import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;

import org.mockito.Mock;

import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UserRecordServiceTest {
    @Mock
    private UserRecordRepository repository;

    @InjectMocks
    private UserRecordService service;

    @Test
    void shouldCreateRecord() {
        UserRecord entity = new UserRecord();
        entity.setId(1L); entity.setReferenceId("TEST-1"); entity.setStatus("PENDING");
        when(repository.save(any(UserRecord.class))).thenReturn(entity);
        var response = service.create(new RecordRequest("TEST-1", "PENDING", "test"));
        assertEquals("TEST-1", response.referenceId());
    }
}
