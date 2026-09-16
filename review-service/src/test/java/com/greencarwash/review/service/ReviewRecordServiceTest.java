package com.greencarwash.review.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import static org.mockito.ArgumentMatchers.any;

import static org.mockito.Mockito.when;

import com.greencarwash.review.dto.request.RecordRequest;

import com.greencarwash.review.entity.ReviewRecord;

import com.greencarwash.review.repository.ReviewRecordRepository;

import org.junit.jupiter.api.Test;

import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;

import org.mockito.Mock;

import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReviewRecordServiceTest {
    @Mock
    private ReviewRecordRepository repository;

    @InjectMocks
    private ReviewRecordService service;

    @Test
    void shouldCreateRecord() {
        ReviewRecord entity = new ReviewRecord();
        entity.setId(1L); entity.setReferenceId("TEST-1"); entity.setStatus("PENDING");
        when(repository.save(any(ReviewRecord.class))).thenReturn(entity);
        var response = service.create(new RecordRequest("TEST-1", "PENDING", "test"));
        assertEquals("TEST-1", response.referenceId());
    }
}
