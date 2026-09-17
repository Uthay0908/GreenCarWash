package com.greencarwash.reporting.service;

import com.greencarwash.reporting.dto.request.RecordRequest;

import com.greencarwash.reporting.dto.response.RecordResponse;

import com.greencarwash.reporting.entity.ReportingRecord;

import com.greencarwash.reporting.exception.ResourceNotFoundException;

import com.greencarwash.reporting.repository.ReportingRecordRepository;

import java.time.Instant;

import java.util.List;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportingRecordService {
    private final ReportingRecordRepository repository;

    public ReportingRecordService(ReportingRecordRepository repository) { this.repository = repository; }

    @Transactional
    public RecordResponse create(RecordRequest request) {
        ReportingRecord entity = new ReportingRecord();
        entity.setReferenceId(request.referenceId());
        entity.setStatus(request.status() == null || request.status().isBlank() ? "PENDING" : request.status());
        entity.setDescription(request.description());
        entity.setCreatedAt(Instant.now());
        return toResponse(repository.save(entity));
    }

    public RecordResponse get(Long id) { return repository.findById(id).map(this::toResponse).orElseThrow(() -> new ResourceNotFoundException("Record not found: " + id)); }
    public List<RecordResponse> all() { return repository.findAll().stream().map(this::toResponse).toList(); }

    @Transactional
    public RecordResponse update(Long id, RecordRequest request) {
        ReportingRecord entity = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Record not found: " + id));
        entity.setReferenceId(request.referenceId()); entity.setStatus(request.status()); entity.setDescription(request.description());
        return toResponse(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) { if (!repository.existsById(id)) throw new ResourceNotFoundException("Record not found: " + id); repository.deleteById(id); }
    private RecordResponse toResponse(ReportingRecord e) { return new RecordResponse(e.getId(), e.getReferenceId(), e.getStatus(), e.getDescription(), e.getCreatedAt()); }
}
