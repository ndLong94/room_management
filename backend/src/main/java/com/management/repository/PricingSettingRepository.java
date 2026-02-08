package com.management.repository;

import com.management.domain.entity.PricingSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PricingSettingRepository extends JpaRepository<PricingSetting, Long> {

    Optional<PricingSetting> findByOwnerUserId(Long ownerUserId);
}
