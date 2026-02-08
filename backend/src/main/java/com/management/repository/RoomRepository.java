package com.management.repository;

import com.management.domain.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByPropertyIdOrderByCreatedAtDesc(Long propertyId);

    Optional<Room> findByIdAndPropertyId(Long id, Long propertyId);

    @Query("SELECT COUNT(r) FROM Room r JOIN Property p ON p.id = r.propertyId WHERE p.ownerUserId = :ownerUserId")
    long countByOwnerUserId(@Param("ownerUserId") Long ownerUserId);

    @Query("SELECT COUNT(r) FROM Room r JOIN Property p ON p.id = r.propertyId WHERE p.ownerUserId = :ownerUserId AND r.status = 'OCCUPIED'")
    long countOccupiedByOwnerUserId(@Param("ownerUserId") Long ownerUserId);

    @Query("SELECT COUNT(r) FROM Room r JOIN Property p ON p.id = r.propertyId WHERE p.ownerUserId = :ownerUserId AND r.status = 'VACANT'")
    long countVacantByOwnerUserId(@Param("ownerUserId") Long ownerUserId);

    @Query("SELECT r FROM Room r WHERE r.paymentDay = :day")
    List<Room> findByPaymentDay(@Param("day") Integer day);
}
