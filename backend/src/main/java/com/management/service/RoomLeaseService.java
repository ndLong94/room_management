package com.management.service;

import com.management.domain.entity.RoomLease;
import com.management.domain.entity.Tenant;
import com.management.dto.request.CreateRoomLeaseRequest;
import com.management.dto.request.UpdateRoomLeaseRequest;
import com.management.dto.response.RoomLeaseResponse;
import com.management.dto.response.TenantResponse;
import com.management.exception.PropertyNotFoundException;
import com.management.exception.RoomLeaseNotFoundException;
import com.management.exception.RoomNotFoundException;
import com.management.exception.TenantNotFoundException;
import com.management.repository.PropertyRepository;
import com.management.repository.RoomLeaseRepository;
import com.management.repository.RoomRepository;
import com.management.repository.TenantRepository;
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
public class RoomLeaseService {

    private final RoomLeaseRepository roomLeaseRepository;
    private final TenantRepository tenantRepository;
    private final PropertyRepository propertyRepository;
    private final RoomRepository roomRepository;

    public List<RoomLeaseResponse> listByRoom(Long propertyId, Long roomId) {
        long userId = currentUserId();
        ensureRoomOwned(propertyId, roomId, userId);
        return roomLeaseRepository.findByRoomIdAndPropertyIdAndOwnerUserId(roomId, propertyId, userId)
                .stream()
                .map(rl -> toResponse(rl, true))
                .collect(Collectors.toList());
    }

    public RoomLeaseResponse getActiveLease(Long propertyId, Long roomId) {
        long userId = currentUserId();
        ensureRoomOwned(propertyId, roomId, userId);
        return roomLeaseRepository.findActiveByRoomIdAndPropertyIdAndOwnerUserId(roomId, propertyId, userId)
                .map(rl -> toResponse(rl, true))
                .orElse(null);
    }

    @Transactional
    public RoomLeaseResponse create(Long propertyId, Long roomId, CreateRoomLeaseRequest createRoomLeaseRequest) {
        long userId = currentUserId();
        ensureRoomOwned(propertyId, roomId, userId);
        Tenant tenant = tenantRepository.findByIdAndOwnerUserId(createRoomLeaseRequest.getTenantId(), userId)
                .orElseThrow(() -> new TenantNotFoundException("Không tìm thấy người thuê: " + createRoomLeaseRequest.getTenantId()));
        // Deactivate any current active lease for this room
        roomLeaseRepository.findFirstByRoomIdAndActiveTrue(roomId).ifPresent(rl -> {
            rl.setActive(false);
            if (rl.getMoveOutDate() == null) {
                rl.setMoveOutDate(LocalDate.now());
            }
            roomLeaseRepository.save(rl);
        });
        BigDecimal deposit = createRoomLeaseRequest.getDepositAmount() != null ? createRoomLeaseRequest.getDepositAmount() : BigDecimal.ZERO;
        RoomLease lease = RoomLease.builder()
                .roomId(roomId)
                .tenantId(tenant.getId())
                .active(true)
                .moveInDate(createRoomLeaseRequest.getMoveInDate())
                .moveOutDate(createRoomLeaseRequest.getMoveOutDate())
                .depositAmount(deposit)
                .build();
        lease = roomLeaseRepository.save(lease);
        return toResponse(lease, true);
    }

    @Transactional
    public RoomLeaseResponse update(Long propertyId, Long roomId, Long leaseId, UpdateRoomLeaseRequest updateRoomLeaseRequest) {
        long userId = currentUserId();
        ensureRoomOwned(propertyId, roomId, userId);
        RoomLease lease = roomLeaseRepository.findById(leaseId)
                .orElseThrow(() -> new RoomLeaseNotFoundException("Không tìm thấy hợp đồng thuê: " + leaseId));
        if (!lease.getRoomId().equals(roomId)) {
            throw new RoomLeaseNotFoundException("Hợp đồng không thuộc phòng này.");
        }
        if (updateRoomLeaseRequest.getMoveInDate() != null) lease.setMoveInDate(updateRoomLeaseRequest.getMoveInDate());
        if (updateRoomLeaseRequest.getMoveOutDate() != null) lease.setMoveOutDate(updateRoomLeaseRequest.getMoveOutDate());
        if (updateRoomLeaseRequest.getDepositAmount() != null) lease.setDepositAmount(updateRoomLeaseRequest.getDepositAmount());
        lease = roomLeaseRepository.save(lease);
        return toResponse(lease, true);
    }

    @Transactional
    public void endLease(Long propertyId, Long roomId, Long leaseId) {
        long userId = currentUserId();
        ensureRoomOwned(propertyId, roomId, userId);
        RoomLease lease = roomLeaseRepository.findById(leaseId)
                .orElseThrow(() -> new RoomLeaseNotFoundException("Không tìm thấy hợp đồng thuê: " + leaseId));
        if (!lease.getRoomId().equals(roomId)) {
            throw new RoomLeaseNotFoundException("Hợp đồng không thuộc phòng này.");
        }
        lease.setActive(false);
        if (lease.getMoveOutDate() == null) {
            lease.setMoveOutDate(LocalDate.now());
        }
        roomLeaseRepository.save(lease);
    }

    private void ensureRoomOwned(Long propertyId, Long roomId, Long userId) {
        if (!propertyRepository.existsByIdAndOwnerUserId(propertyId, userId)) {
            throw new PropertyNotFoundException("Không tìm thấy bất động sản: " + propertyId);
        }
        if (!roomRepository.findByIdAndPropertyId(roomId, propertyId).isPresent()) {
            throw new RoomNotFoundException("Không tìm thấy phòng: " + roomId);
        }
    }

    private RoomLeaseResponse toResponse(RoomLease rl, boolean loadTenant) {
        TenantResponse tenantResp = loadTenant
                ? tenantRepository.findById(rl.getTenantId()).map(RoomLeaseService::tenantToResponse).orElse(null)
                : null;
        return RoomLeaseResponse.builder()
                .id(rl.getId())
                .roomId(rl.getRoomId())
                .tenantId(rl.getTenantId())
                .active(rl.getActive())
                .moveInDate(rl.getMoveInDate())
                .moveOutDate(rl.getMoveOutDate())
                .depositAmount(rl.getDepositAmount())
                .createdAt(rl.getCreatedAt())
                .tenant(tenantResp)
                .build();
    }

    private static TenantResponse tenantToResponse(Tenant t) {
        return TenantResponse.builder()
                .id(t.getId())
                .ownerUserId(t.getOwnerUserId())
                .fullName(t.getFullName())
                .phone(t.getPhone())
                .idNumber(t.getIdNumber())
                .idType(t.getIdType())
                .address(t.getAddress())
                .createdAt(t.getCreatedAt())
                .build();
    }

    private long currentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getUser().getId();
    }
}
