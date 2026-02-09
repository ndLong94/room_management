package com.management.repository;

import com.management.domain.entity.MeterReading;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface MeterReadingRepository extends JpaRepository<MeterReading, Long> {

    Optional<MeterReading> findByRoomIdAndMonthAndYear(Long roomId, int month, int year);

    List<MeterReading> findByRoomIdInAndMonthAndYear(Collection<Long> roomIds, int month, int year);

    /** Tìm số điện nước cuối cùng của phòng (theo year DESC, month DESC) */
    @Query("SELECT m FROM MeterReading m WHERE m.roomId = :roomId ORDER BY m.year DESC, m.month DESC")
    List<MeterReading> findByRoomIdOrderByYearDescMonthDesc(@Param("roomId") Long roomId);
}
