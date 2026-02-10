package com.management.repository;

import com.management.domain.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TenantRepository extends JpaRepository<Tenant, Long> {

    List<Tenant> findByOwnerUserIdOrderByCreatedAtDesc(Long ownerUserId);

    Optional<Tenant> findByIdAndOwnerUserId(Long id, Long ownerUserId);
}
