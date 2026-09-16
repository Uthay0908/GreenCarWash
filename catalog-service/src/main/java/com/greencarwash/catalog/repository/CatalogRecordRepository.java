package com.greencarwash.catalog.repository;

import com.greencarwash.catalog.entity.CatalogRecord;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CatalogRecordRepository extends JpaRepository<CatalogRecord, Long> {
}
