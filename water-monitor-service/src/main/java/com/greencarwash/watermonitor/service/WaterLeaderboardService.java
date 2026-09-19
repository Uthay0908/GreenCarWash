package com.greencarwash.watermonitor.service;

import com.greencarwash.watermonitor.dto.LeaderboardEntryResponse;
import com.greencarwash.watermonitor.repository.WaterSavingRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WaterLeaderboardService {

    private final WaterSavingRecordRepository waterRecordRepository;

    @Transactional(readOnly = true)
    public List<LeaderboardEntryResponse> getAllTimeLeaderboard(int limit) {
        int pageSize = limit > 0 ? Math.min(limit, 100) : 20;
        List<WaterSavingRecordRepository.LeaderboardProjection> projections =
                waterRecordRepository.findTopSaversAllTime(PageRequest.of(0, pageSize));

        return buildRankedList(projections);
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntryResponse> getMonthlyLeaderboard(Integer year, Integer month, int limit) {
        LocalDate now = LocalDate.now();
        int y = (year != null && year > 2000) ? year : now.getYear();
        int m = (month != null && month >= 1 && month <= 12) ? month : now.getMonthValue();

        LocalDate startDate = LocalDate.of(y, m, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        int pageSize = limit > 0 ? Math.min(limit, 100) : 20;
        List<WaterSavingRecordRepository.LeaderboardProjection> projections =
                waterRecordRepository.findTopSaversBetweenDates(
                        startDate.atStartOfDay().toInstant(ZoneOffset.UTC),
                        endDate.atTime(23, 59, 59).toInstant(ZoneOffset.UTC),
                        PageRequest.of(0, pageSize)
                );

        return buildRankedList(projections);
    }

    private List<LeaderboardEntryResponse> buildRankedList(List<WaterSavingRecordRepository.LeaderboardProjection> projections) {
        List<LeaderboardEntryResponse> result = new ArrayList<>();
        int rank = 1;
        for (WaterSavingRecordRepository.LeaderboardProjection p : projections) {
            result.add(LeaderboardEntryResponse.builder()
                    .rank(rank++)
                    .customerId(p.getCustomerId())
                    .customerName(p.getCustomerName() != null ? p.getCustomerName() : "Eco Hero")
                    .totalLitresSaved(p.getTotalLitresSaved() != null ? p.getTotalLitresSaved().setScale(2, RoundingMode.HALF_UP) : null)
                    .totalGallonsSaved(p.getTotalGallonsSaved() != null ? p.getTotalGallonsSaved().setScale(2, RoundingMode.HALF_UP) : null)
                    .totalWashes(p.getTotalWashes() != null ? p.getTotalWashes() : 0L)
                    .build());
        }
        return result;
    }
}
