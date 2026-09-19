package com.greencarwash.catalog.service;

import com.greencarwash.catalog.dto.PromotionRequest;
import com.greencarwash.catalog.dto.PromotionResponse;
import com.greencarwash.catalog.entity.Promotion;
import com.greencarwash.catalog.repository.PromotionRepository;
import com.greencarwash.common.core.exception.ConflictException;
import com.greencarwash.common.core.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;

    @Transactional(readOnly = true)
    public List<PromotionResponse> getAllPromotions() {
        return promotionRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PromotionResponse getValidPromotion(String code) {
        Instant now = Instant.now();
        Promotion promo = promotionRepository.findByCodeAndActiveTrueAndStartDateBeforeAndEndDateAfter(
                code.toUpperCase().trim(), now, now)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", "code", code));
        return mapToResponse(promo);
    }

    @Transactional
    public PromotionResponse createPromotion(PromotionRequest request) {
        if (promotionRepository.findByCodeAndActiveTrue(request.getCode().toUpperCase().trim()).isPresent()) {
            throw new ConflictException("Promotion code already exists: " + request.getCode());
        }

        Promotion promo = Promotion.builder()
                .code(request.getCode().toUpperCase().trim())
                .description(request.getDescription())
                .discountPercentage(request.getDiscountPercentage())
                .discountFixedAmount(request.getDiscountFixedAmount())
                .minOrderAmount(request.getMinOrderAmount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        promo = promotionRepository.save(promo);
        log.info("Created promotion: code={}", promo.getCode());
        return mapToResponse(promo);
    }

    @Transactional
    public void deactivatePromotion(String id) {
        Promotion promo = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", "id", id));
        promo.setActive(false);
        promotionRepository.save(promo);
        log.info("Deactivated promotion: {}", id);
    }

    private PromotionResponse mapToResponse(Promotion p) {
        return PromotionResponse.builder()
                .id(p.getId())
                .code(p.getCode())
                .description(p.getDescription())
                .discountPercentage(p.getDiscountPercentage())
                .discountFixedAmount(p.getDiscountFixedAmount())
                .minOrderAmount(p.getMinOrderAmount())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .active(p.isActive())
                .build();
    }
}
