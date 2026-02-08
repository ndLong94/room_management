package com.management.repository;

import com.management.domain.entity.UserPlatformPrice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserPlatformPriceRepository extends JpaRepository<UserPlatformPrice, Long> {

    Optional<UserPlatformPrice> findByUserId(Long userId);
}
