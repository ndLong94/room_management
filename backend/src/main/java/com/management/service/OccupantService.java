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
import com.management.util.Text;
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
    public OccupantResponse create(Long propertyId, Long roomId, CreateOccupantRequest createOccupantRequest) {
        ensureRoomOwnedByCurrentUser(propertyId, roomId);
        Room room = roomRepository.findByIdAndPropertyId(roomId, propertyId)
                .orElseThrow(() -> new RoomNotFoundException("Room not found: " + roomId));
        if (room.getStatus() != RoomStatus.OCCUPIED) {
            throw new IllegalStateException("Chỉ được thêm người ở khi phòng đang cho thuê.");
        }
        Occupant occupant = Occupant.builder()
                .roomId(roomId)
                .fullName(createOccupantRequest.getFullName().trim())
                .phone(Text.trimToNull(createOccupantRequest.getPhone()))
                .idNumber(Text.trimToNull(createOccupantRequest.getIdNumber()))
                .idType(Text.trimToNull(createOccupantRequest.getIdType()))
                .address(Text.trimToNull(createOccupantRequest.getAddress()))
                .dob(createOccupantRequest.getDob())
                .avatarUrl(Text.trimToNull(createOccupantRequest.getAvatarUrl()))
                .idFrontUrl(Text.trimToNull(createOccupantRequest.getIdFrontUrl()))
                .idBackUrl(Text.trimToNull(createOccupantRequest.getIdBackUrl()))
                .tempResidenceUrl(Text.trimToNull(createOccupantRequest.getTempResidenceUrl()))
                .note(createOccupantRequest.getNote())
                .zaloUserId(Text.trimToNull(createOccupantRequest.getZaloUserId()))
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
    public OccupantResponse update(Long id, UpdateOccupantRequest updateOccupantRequest) {
        long userId = currentUserId();
        Occupant occupant = occupantRepository.findByIdAndOwnerUserId(id, userId)
                .orElseThrow(() -> new OccupantNotFoundException("Occupant not found: " + id));
        occupant.setFullName(updateOccupantRequest.getFullName().trim());
        occupant.setPhone(Text.trimToNull(updateOccupantRequest.getPhone()));
        occupant.setIdNumber(Text.trimToNull(updateOccupantRequest.getIdNumber()));
        occupant.setIdType(Text.trimToNull(updateOccupantRequest.getIdType()));
        occupant.setAddress(Text.trimToNull(updateOccupantRequest.getAddress()));
        occupant.setDob(updateOccupantRequest.getDob());
        occupant.setAvatarUrl(Text.trimToNull(updateOccupantRequest.getAvatarUrl()));
        occupant.setIdFrontUrl(Text.trimToNull(updateOccupantRequest.getIdFrontUrl()));
        occupant.setIdBackUrl(Text.trimToNull(updateOccupantRequest.getIdBackUrl()));
        occupant.setTempResidenceUrl(Text.trimToNull(updateOccupantRequest.getTempResidenceUrl()));
        occupant.setNote(updateOccupantRequest.getNote());
        occupant.setZaloUserId(Text.trimToNull(updateOccupantRequest.getZaloUserId()));
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
                .zaloUserId(o.getZaloUserId())
                .createdAt(o.getCreatedAt())
                .build();
    }
}
