package com.greencarwash.catalog.repository;

import com.greencarwash.catalog.entity.WashPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WashPackageRepository extends JpaRepository<WashPackage, String> {
    List<WashPackage> findByActiveTrue();
}
