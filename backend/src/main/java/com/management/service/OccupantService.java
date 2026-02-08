package com.management.service;

import com.management.domain.entity.Occupant;
import com.management.domain.entity.Room;
import com.management.domain.enums.RoomStatus;
import com.management.dto.request.CreateOccupantRequest;
import com.management.dto.request.UpdateOccupantRequest;
import com.management.dto.response.OccupantResponse;
import com.management.exception.OccupantNotFoundException;
import com.management.exception.PropertyNotFoundException;
import com.management.exception.RoomNotFoundException;
import com.management.repository.OccupantRepository;
import com.management.repository.PropertyRepository;
import com.management.repository.RoomRepository;
import com.management.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OccupantService {

    private final OccupantRepository occupantRepository;
    private final RoomRepository roomRepository;
    private final PropertyRepository propertyRepository;

    public List<OccupantResponse> listByRoom(Long propertyId, Long roomId) {
        ensureRoomOwnedByCurrentUser(propertyId, roomId);
        return occupantRepository.findByRoomIdOrderByCreatedAtDesc(roomId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OccupantResponse create(Long propertyId, Long roomId, CreateOccupantRequest request) {
        ensureRoomOwnedByCurrentUser(propertyId, roomId);
        Room room = roomRepository.findByIdAndPropertyId(roomId, propertyId)
                .orElseThrow(() -> new RoomNotFoundException("Room not found: " + roomId));
        if (room.getStatus() != RoomStatus.OCCUPIED) {
            throw new IllegalStateException("Chỉ được thêm người ở khi phòng đang cho thuê.");
        }
        Occupant occupant = Occupant.builder()
                .roomId(roomId)
                .fullName(request.getFullName().trim())
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .idNumber(request.getIdNumber() != null ? request.getIdNumber().trim() : null)
                .idType(request.getIdType() != null ? request.getIdType().trim() : null)
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .dob(request.getDob())
                .avatarUrl(request.getAvatarUrl() != null ? request.getAvatarUrl().trim() : null)
                .idFrontUrl(request.getIdFrontUrl() != null ? request.getIdFrontUrl().trim() : null)
                .idBackUrl(request.getIdBackUrl() != null ? request.getIdBackUrl().trim() : null)
                .tempResidenceUrl(request.getTempResidenceUrl() != null ? request.getTempResidenceUrl().trim() : null)
                .note(request.getNote())
                .build();
        occupant = occupantRepository.save(occupant);
        return toResponse(occupant);
    }

    public OccupantResponse getById(Long id) {
        long userId = currentUserId();
        Occupant occupant = occupantRepository.findByIdAndOwnerUserId(id, userId)
                .orElseThrow(() -> new OccupantNotFoundException("Occupant not found: " + id));
        return toResponse(occupant);
    }

    @Transactional
    public OccupantResponse update(Long id, UpdateOccupantRequest request) {
        long userId = currentUserId();
        Occupant occupant = occupantRepository.findByIdAndOwnerUserId(id, userId)
                .orElseThrow(() -> new OccupantNotFoundException("Occupant not found: " + id));
        occupant.setFullName(request.getFullName().trim());
        occupant.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        occupant.setIdNumber(request.getIdNumber() != null ? request.getIdNumber().trim() : null);
        occupant.setIdType(request.getIdType() != null ? request.getIdType().trim() : null);
        occupant.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);
        occupant.setDob(request.getDob());
        occupant.setAvatarUrl(request.getAvatarUrl() != null ? request.getAvatarUrl().trim() : null);
        occupant.setIdFrontUrl(request.getIdFrontUrl() != null ? request.getIdFrontUrl().trim() : null);
        occupant.setIdBackUrl(request.getIdBackUrl() != null ? request.getIdBackUrl().trim() : null);
        occupant.setTempResidenceUrl(request.getTempResidenceUrl() != null ? request.getTempResidenceUrl().trim() : null);
        occupant.setNote(request.getNote());
        occupant = occupantRepository.save(occupant);
        return toResponse(occupant);
    }

    @Transactional
    public void delete(Long id) {
        long userId = currentUserId();
        if (!occupantRepository.findByIdAndOwnerUserId(id, userId).isPresent()) {
            throw new OccupantNotFoundException("Occupant not found: " + id);
        }
        occupantRepository.deleteById(id);
    }

    private void ensureRoomOwnedByCurrentUser(Long propertyId, Long roomId) {
        long userId = currentUserId();
        if (!propertyRepository.existsByIdAndOwnerUserId(propertyId, userId)) {
            throw new PropertyNotFoundException("Property not found: " + propertyId);
        }
        if (!roomRepository.findByIdAndPropertyId(roomId, propertyId).isPresent()) {
            throw new RoomNotFoundException("Room not found: " + roomId);
        }
    }

    private long currentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getUser().getId();
    }

    private OccupantResponse toResponse(Occupant o) {
        return OccupantResponse.builder()
                .id(o.getId())
                .roomId(o.getRoomId())
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
                .createdAt(o.getCreatedAt())
                .build();
    }
}
