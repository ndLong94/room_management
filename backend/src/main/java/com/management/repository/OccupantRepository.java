package com.management.repository;

import com.management.domain.entity.Occupant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OccupantRepository extends JpaRepository<Occupant, Long> {

    List<Occupant> findByRoomIdOrderByCreatedAtDesc(Long roomId);

    Optional<Occupant> findByIdAndRoomId(Long id, Long roomId);

    @Query("SELECT o FROM Occupant o JOIN Room r ON r.id = o.roomId JOIN Property p ON p.id = r.propertyId WHERE o.id = :id AND p.ownerUserId = :ownerUserId")
    Optional<Occupant> findByIdAndOwnerUserId(@Param("id") Long id, @Param("ownerUserId") Long ownerUserId);
}
