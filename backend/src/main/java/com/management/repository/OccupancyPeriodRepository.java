package com.management.repository;

import com.management.domain.entity.OccupancyPeriod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OccupancyPeriodRepository extends JpaRepository<OccupancyPeriod, Long> {

    List<OccupancyPeriod> findByRoomIdOrderByEndYearDescEndMonthDesc(Long roomId);
}
