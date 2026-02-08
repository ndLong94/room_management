package com.management.repository;

import com.management.domain.entity.MeterReading;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MeterReadingRepository extends JpaRepository<MeterReading, Long> {

    Optional<MeterReading> findByRoomIdAndMonthAndYear(Long roomId, int month, int year);
}
