package com.management.repository;

import com.management.domain.entity.OccupancyPeriodOccupant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OccupancyPeriodOccupantRepository extends JpaRepository<OccupancyPeriodOccupant, Long> {

    List<OccupancyPeriodOccupant> findByPeriodIdOrderByCreatedAtAsc(Long periodId);
}
