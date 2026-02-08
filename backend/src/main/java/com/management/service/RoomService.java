package com.management.service;

import com.management.domain.entity.OccupancyPeriod;
import com.management.domain.entity.OccupancyPeriodOccupant;
import com.management.domain.entity.Occupant;
import com.management.domain.entity.Room;
import com.management.domain.enums.RoomStatus;
import com.management.dto.request.CreateRoomRequest;
import com.management.dto.request.UpdateRoomRequest;
import com.management.dto.response.RoomResponse;
import com.management.exception.PropertyNotFoundException;
import com.management.exception.RoomNotFoundException;
import com.management.repository.OccupancyPeriodOccupantRepository;
import com.management.repository.OccupancyPeriodRepository;
import com.management.repository.OccupantRepository;
import com.management.repository.PropertyRepository;
import com.management.repository.RoomRepository;
import com.management.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final PropertyRepository propertyRepository;
    private final OccupantRepository occupantRepository;
    private final OccupancyPeriodRepository occupancyPeriodRepository;
    private final OccupancyPeriodOccupantRepository occupancyPeriodOccupantRepository;

    public List<RoomResponse> listByProperty(Long propertyId) {
        ensurePropertyOwnedByCurrentUser(propertyId);
        return roomRepository.findByPropertyIdOrderByCreatedAtDesc(propertyId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public RoomResponse getByPropertyAndId(Long propertyId, Long roomId) {
        ensurePropertyOwnedByCurrentUser(propertyId);
        Room room = roomRepository.findByIdAndPropertyId(roomId, propertyId)
                .orElseThrow(() -> new RoomNotFoundException("Room not found: " + roomId));
        return toResponse(room);
    }

    @Transactional
    public RoomResponse create(Long propertyId, CreateRoomRequest request) {
        ensurePropertyOwnedByCurrentUser(propertyId);
        Room room = Room.builder()
                .propertyId(propertyId)
                .name(request.getName().trim())
                .rentPrice(request.getRentPrice() != null ? request.getRentPrice() : BigDecimal.ZERO)
                .status(request.getStatus() != null ? request.getStatus() : RoomStatus.VACANT)
                .paymentDay(request.getPaymentDay())
                .build();
        room = roomRepository.save(room);
        return toResponse(room);
    }

    @Transactional
    public RoomResponse update(Long propertyId, Long roomId, UpdateRoomRequest request) {
        ensurePropertyOwnedByCurrentUser(propertyId);
        Room room = roomRepository.findByIdAndPropertyId(roomId, propertyId)
                .orElseThrow(() -> new RoomNotFoundException("Room not found: " + roomId));
        RoomStatus newStatus = request.getStatus();
        if (newStatus == RoomStatus.VACANT && room.getStatus() == RoomStatus.OCCUPIED) {
            archiveOccupantsAndVacate(propertyId, roomId, room);
        }
        room.setName(request.getName().trim());
        room.setRentPrice(request.getRentPrice() != null ? request.getRentPrice() : BigDecimal.ZERO);
        room.setStatus(newStatus);
        room.setContractUrl(request.getContractUrl() != null ? request.getContractUrl().trim() : null);
        room.setPaymentDay(request.getPaymentDay());
        room = roomRepository.save(room);
        return toResponse(room);
    }

    /** When switching room from OCCUPIED to VACANT: create an occupancy period (snapshot) and delete current occupants. */
    private void archiveOccupantsAndVacate(Long propertyId, Long roomId, Room room) {
        List<Occupant> occupants = occupantRepository.findByRoomIdOrderByCreatedAtDesc(roomId);
        if (occupants.isEmpty()) {
            return;
        }
        LocalDate now = LocalDate.now();
        OccupancyPeriod period = OccupancyPeriod.builder()
                .roomId(roomId)
                .propertyId(propertyId)
                .startMonth(null)
                .startYear(null)
                .endMonth(now.getMonthValue())
                .endYear(now.getYear())
                .build();
        period = occupancyPeriodRepository.save(period);
        for (Occupant o : occupants) {
            OccupancyPeriodOccupant po = OccupancyPeriodOccupant.builder()
                    .periodId(period.getId())
                    .fullName(o.getFullName())
                    .phone(o.getPhone())
                    .idNumber(o.getIdNumber())
                    .idType(o.getIdType())
                    .address(o.getAddress())
                    .dob(o.getDob())
                    .avatarUrl(o.getAvatarUrl())
                    .idFrontUrl(o.getIdFrontUrl())
                    .idBackUrl(o.getIdBackUrl())
                    .tempResidenceUrl(o.getTempResidenceUrl())
                    .note(o.getNote())
                    .build();
            occupancyPeriodOccupantRepository.save(po);
        }
        occupantRepository.deleteAll(occupants);
    }

    @Transactional
    public void delete(Long propertyId, Long roomId) {
        ensurePropertyOwnedByCurrentUser(propertyId);
        if (!roomRepository.findByIdAndPropertyId(roomId, propertyId).isPresent()) {
            throw new RoomNotFoundException("Room not found: " + roomId);
        }
        roomRepository.deleteById(roomId);
    }

    private void ensurePropertyOwnedByCurrentUser(Long propertyId) {
        Long userId = currentUserId();
        if (!propertyRepository.existsByIdAndOwnerUserId(propertyId, userId)) {
            throw new PropertyNotFoundException("Property not found: " + propertyId);
        }
    }

    private Long currentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getUser().getId();
    }

    private RoomResponse toResponse(Room r) {
        return RoomResponse.builder()
                .id(r.getId())
                .propertyId(r.getPropertyId())
                .name(r.getName())
                .rentPrice(r.getRentPrice())
                .status(r.getStatus())
                .contractUrl(r.getContractUrl())
                .paymentDay(r.getPaymentDay())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
