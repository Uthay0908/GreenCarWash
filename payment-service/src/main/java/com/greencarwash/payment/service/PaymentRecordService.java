package com.greencarwash.payment.service;

import com.greencarwash.payment.dto.request.RecordRequest;

import com.greencarwash.payment.dto.response.RecordResponse;

import com.greencarwash.payment.entity.PaymentRecord;

import com.greencarwash.payment.exception.ResourceNotFoundException;

import com.greencarwash.payment.repository.PaymentRecordRepository;

import java.time.Instant;

import java.util.List;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentRecordService {
    private final PaymentRecordRepository repository;

    public PaymentRecordService(PaymentRecordRepository repository) { this.repository = repository; }

    @Transactional
    public RecordResponse create(RecordRequest request) {
        PaymentRecord entity = new PaymentRecord();
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
        PaymentRecord entity = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Record not found: " + id));
        entity.setReferenceId(request.referenceId()); entity.setStatus(request.status()); entity.setDescription(request.description());
        return toResponse(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) { if (!repository.existsById(id)) throw new ResourceNotFoundException("Record not found: " + id); repository.deleteById(id); }
    private RecordResponse toResponse(PaymentRecord e) { return new RecordResponse(e.getId(), e.getReferenceId(), e.getStatus(), e.getDescription(), e.getCreatedAt()); }
}
