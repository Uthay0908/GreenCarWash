package com.greencarwash.notification.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import static org.mockito.ArgumentMatchers.any;

import static org.mockito.Mockito.when;

import com.greencarwash.notification.dto.request.RecordRequest;

import com.greencarwash.notification.entity.NotificationRecord;

import com.greencarwash.notification.repository.NotificationRecordRepository;

import org.junit.jupiter.api.Test;

import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;

import org.mockito.Mock;

import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class NotificationRecordServiceTest {
    @Mock
    private NotificationRecordRepository repository;

    @InjectMocks
    private NotificationRecordService service;

    @Test
    void shouldCreateRecord() {
        NotificationRecord entity = new NotificationRecord();
        entity.setId(1L); entity.setReferenceId("TEST-1"); entity.setStatus("PENDING");
        when(repository.save(any(NotificationRecord.class))).thenReturn(entity);
        var response = service.create(new RecordRequest("TEST-1", "PENDING", "test"));
        assertEquals("TEST-1", response.referenceId());
    }
}
