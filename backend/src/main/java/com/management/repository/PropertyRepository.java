package com.management.repository;

import com.management.domain.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findAllByOwnerUserIdOrderByCreatedAtDesc(Long ownerUserId);

    Optional<Property> findByIdAndOwnerUserId(Long id, Long ownerUserId);

    boolean existsByIdAndOwnerUserId(Long id, Long ownerUserId);

    void deleteByIdAndOwnerUserId(Long id, Long ownerUserId);
}
