package com.greencarwash.watermonitor.repository;

import com.greencarwash.watermonitor.entity.WaterSavingRecord;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface WaterSavingRecordRepository extends JpaRepository<WaterSavingRecord, String> {

    Optional<WaterSavingRecord> findByBookingId(String bookingId);

    List<WaterSavingRecord> findByCustomerIdOrderByRecordedAtDesc(String customerId);

    @Query("SELECT COALESCE(SUM(r.savedLitres), 0) FROM WaterSavingRecord r WHERE r.customerId = :customerId")
    BigDecimal sumSavedLitresByCustomerId(@Param("customerId") String customerId);

    @Query("SELECT COALESCE(SUM(r.savedGallons), 0) FROM WaterSavingRecord r WHERE r.customerId = :customerId")
    BigDecimal sumSavedGallonsByCustomerId(@Param("customerId") String customerId);

    long countByCustomerId(String customerId);

    // Global Stats
    @Query("SELECT COALESCE(SUM(r.savedLitres), 0) FROM WaterSavingRecord r")
    BigDecimal sumAllSavedLitres();

    @Query("SELECT COALESCE(SUM(r.savedGallons), 0) FROM WaterSavingRecord r")
    BigDecimal sumAllSavedGallons();

    // Leaderboard interface projections
    public interface LeaderboardProjection {
        String getCustomerId();
        String getCustomerName();
        BigDecimal getTotalLitresSaved();
        BigDecimal getTotalGallonsSaved();
        Long getTotalWashes();
    }

    @Query("SELECT r.customerId as customerId, " +
           "MAX(r.customerName) as customerName, " +
           "SUM(r.savedLitres) as totalLitresSaved, " +
           "SUM(r.savedGallons) as totalGallonsSaved, " +
           "COUNT(r.id) as totalWashes " +
           "FROM WaterSavingRecord r " +
           "GROUP BY r.customerId " +
           "ORDER BY totalLitresSaved DESC")
    List<LeaderboardProjection> findTopSaversAllTime(Pageable pageable);

    @Query("SELECT r.customerId as customerId, " +
           "MAX(r.customerName) as customerName, " +
           "SUM(r.savedLitres) as totalLitresSaved, " +
           "SUM(r.savedGallons) as totalGallonsSaved, " +
           "COUNT(r.id) as totalWashes " +
           "FROM WaterSavingRecord r " +
           "WHERE r.recordedAt >= :start AND r.recordedAt <= :end " +
           "GROUP BY r.customerId " +
           "ORDER BY totalLitresSaved DESC")
    List<LeaderboardProjection> findTopSaversBetweenDates(
            @Param("start") Instant start,
            @Param("end") Instant end,
            Pageable pageable);
}
