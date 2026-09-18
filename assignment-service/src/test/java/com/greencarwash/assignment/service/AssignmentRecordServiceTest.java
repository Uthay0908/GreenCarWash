package com.greencarwash.assignment.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import static org.mockito.ArgumentMatchers.any;

import static org.mockito.Mockito.when;

import com.greencarwash.assignment.dto.request.RecordRequest;

import com.greencarwash.assignment.entity.AssignmentRecord;

import com.greencarwash.assignment.repository.AssignmentRecordRepository;

import org.junit.jupiter.api.Test;

import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;

import org.mockito.Mock;

import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AssignmentRecordServiceTest {
    @Mock
    private AssignmentRecordRepository repository;

    @InjectMocks
    private AssignmentRecordService service;

    @Test
    void shouldCreateRecord() {
        AssignmentRecord entity = new AssignmentRecord();
        entity.setId(1L); entity.setReferenceId("TEST-1"); entity.setStatus("PENDING");
        when(repository.save(any(AssignmentRecord.class))).thenReturn(entity);
        var response = service.create(new RecordRequest("TEST-1", "PENDING", "test"));
        assertEquals("TEST-1", response.referenceId());
    }
}
