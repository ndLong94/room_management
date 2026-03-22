package com.management.service;

import com.management.domain.entity.PricingSetting;
import com.management.dto.request.UpdatePricingSettingRequest;
import com.management.dto.response.PricingSettingResponse;
import com.management.repository.PricingSettingRepository;
import com.management.security.UserPrincipal;
import com.management.util.Text;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PricingSettingService {

    private final PricingSettingRepository pricingSettingRepository;

    public PricingSettingResponse getForCurrentUser() {
        Long userId = currentUserId();
        PricingSetting setting = pricingSettingRepository.findByOwnerUserId(userId)
                .orElseGet(() -> createDefault(userId));
        return toResponse(setting);
    }

    @Transactional
    public PricingSettingResponse updateForCurrentUser(UpdatePricingSettingRequest updatePricingSettingRequest) {
        Long userId = currentUserId();
        PricingSetting setting = pricingSettingRepository.findByOwnerUserId(userId)
                .orElseGet(() -> createDefault(userId));
        setting.setElecPrice(updatePricingSettingRequest.getElecPrice());
        setting.setWaterPrice(updatePricingSettingRequest.getWaterPrice());
        String currency = Text.trimToNull(updatePricingSettingRequest.getCurrency());
        if (currency != null) {
            setting.setCurrency(currency);
        }
        setting = pricingSettingRepository.save(setting);
        return toResponse(setting);
    }

    private PricingSetting createDefault(Long userId) {
        PricingSetting s = PricingSetting.builder()
                .ownerUserId(userId)
                .elecPrice(java.math.BigDecimal.ZERO)
                .waterPrice(java.math.BigDecimal.ZERO)
                .currency("VND")
                .build();
        return pricingSettingRepository.save(s);
    }

    private long currentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getUser().getId();
    }

    private static PricingSettingResponse toResponse(PricingSetting s) {
        return PricingSettingResponse.builder()
                .id(s.getId())
                .ownerUserId(s.getOwnerUserId())
                .elecPrice(s.getElecPrice())
                .waterPrice(s.getWaterPrice())
                .currency(s.getCurrency())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
