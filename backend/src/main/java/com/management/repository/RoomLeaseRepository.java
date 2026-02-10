package com.management.repository;

import com.management.domain.entity.RoomLease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoomLeaseRepository extends JpaRepository<RoomLease, Long> {

    List<RoomLease> findByRoomIdOrderByCreatedAtDesc(Long roomId);

    Optional<RoomLease> findFirstByRoomIdAndActiveTrue(Long roomId);

    List<RoomLease> findByTenantIdOrderByCreatedAtDesc(Long tenantId);

    @Query("SELECT rl FROM RoomLease rl, Room r, Property p WHERE r.id = rl.roomId AND p.id = r.propertyId AND rl.roomId = :roomId AND p.id = :propertyId AND p.ownerUserId = :ownerUserId ORDER BY rl.createdAt DESC")
    List<RoomLease> findByRoomIdAndPropertyIdAndOwnerUserId(
            @Param("roomId") Long roomId,
            @Param("propertyId") Long propertyId,
            @Param("ownerUserId") Long ownerUserId);

    @Query("SELECT rl FROM RoomLease rl, Room r, Property p WHERE r.id = rl.roomId AND p.id = r.propertyId AND rl.roomId = :roomId AND rl.active = true AND p.id = :propertyId AND p.ownerUserId = :ownerUserId")
    Optional<RoomLease> findActiveByRoomIdAndPropertyIdAndOwnerUserId(
            @Param("roomId") Long roomId,
            @Param("propertyId") Long propertyId,
            @Param("ownerUserId") Long ownerUserId);
}
