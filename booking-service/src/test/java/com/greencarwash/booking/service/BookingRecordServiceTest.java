package com.greencarwash.booking.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import static org.mockito.ArgumentMatchers.any;

import static org.mockito.Mockito.when;

import com.greencarwash.booking.dto.request.RecordRequest;

import com.greencarwash.booking.entity.BookingRecord;

import com.greencarwash.booking.repository.BookingRecordRepository;

import org.junit.jupiter.api.Test;

import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;

import org.mockito.Mock;

import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BookingRecordServiceTest {
    @Mock
    private BookingRecordRepository repository;

    @InjectMocks
    private BookingRecordService service;

    @Test
    void shouldCreateRecord() {
        BookingRecord entity = new BookingRecord();
        entity.setId(1L); entity.setReferenceId("TEST-1"); entity.setStatus("PENDING");
        when(repository.save(any(BookingRecord.class))).thenReturn(entity);
        var response = service.create(new RecordRequest("TEST-1", "PENDING", "test"));
        assertEquals("TEST-1", response.referenceId());
    }
}
