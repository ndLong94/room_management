package com.management.repository;

import com.management.domain.entity.UserPlatformPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserPlatformPaymentRepository extends JpaRepository<UserPlatformPayment, Long> {

    List<UserPlatformPayment> findByUserIdOrderByPaidAtDesc(Long userId);
}
