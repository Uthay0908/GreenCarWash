package com.greencarwash.catalog.repository;

import com.greencarwash.catalog.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, String> {
    Optional<Promotion> findByCodeAndActiveTrue(String code);
    Optional<Promotion> findByCodeAndActiveTrueAndStartDateBeforeAndEndDateAfter(String code, Instant now1, Instant now2);
}
