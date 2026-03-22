package com.management.service;

import com.management.domain.entity.OccupancyPeriod;
import com.management.domain.entity.OccupancyPeriodOccupant;
import com.management.dto.response.OccupancyPeriodOccupantResponse;
import com.management.dto.response.OccupancyPeriodResponse;
import com.management.exception.OccupancyPeriodNotFoundException;
import com.management.exception.PropertyNotFoundException;
import com.management.exception.RoomNotFoundException;
import com.management.repository.OccupancyPeriodOccupantRepository;
import com.management.repository.OccupancyPeriodRepository;
import com.management.repository.PropertyRepository;
import com.management.repository.RoomRepository;
import com.management.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OccupancyPeriodService {

    private final PropertyRepository propertyRepository;
    private final RoomRepository roomRepository;
    private final OccupancyPeriodRepository occupancyPeriodRepository;
    private final OccupancyPeriodOccupantRepository occupancyPeriodOccupantRepository;

    public List<OccupancyPeriodResponse> listByRoom(Long propertyId, Long roomId) {
        ensurePropertyAndRoomOwned(propertyId, roomId);
        return occupancyPeriodRepository.findByRoomIdOrderByEndYearDescEndMonthDesc(roomId)
                .stream()
                .map(this::toPeriodResponse)
                .collect(Collectors.toList());
    }

    public OccupancyPeriodResponse getPeriod(Long propertyId, Long roomId, Long periodId) {
        ensurePropertyAndRoomOwned(propertyId, roomId);
        OccupancyPeriod period = occupancyPeriodRepository.findByIdAndRoomIdAndPropertyId(periodId, roomId, propertyId)
                .orElseThrow(() -> new OccupancyPeriodNotFoundException("Occupancy period not found: " + periodId));
        return toPeriodResponse(period);
    }

    public List<OccupancyPeriodOccupantResponse> listOccupantsByPeriod(Long propertyId, Long roomId, Long periodId) {
        ensurePropertyAndRoomOwned(propertyId, roomId);
        OccupancyPeriod period = occupancyPeriodRepository.findByIdAndRoomIdAndPropertyId(periodId, roomId, propertyId)
                .orElseThrow(() -> new OccupancyPeriodNotFoundException("Occupancy period not found: " + periodId));
        return occupancyPeriodOccupantRepository.findByPeriodIdOrderByCreatedAtAsc(periodId)
                .stream()
                .map(this::toPeriodOccupantResponse)
                .collect(Collectors.toList());
    }

    private void ensurePropertyAndRoomOwned(Long propertyId, Long roomId) {
        Long userId = currentUserId();
        if (!propertyRepository.existsByIdAndOwnerUserId(propertyId, userId)) {
            throw new PropertyNotFoundException("Property not found: " + propertyId);
        }
        if (roomRepository.findByIdAndPropertyId(roomId, propertyId).isEmpty()) {
            throw new RoomNotFoundException("Room not found: " + roomId);
        }
    }

    private Long currentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getUser().getId();
    }

    private OccupancyPeriodResponse toPeriodResponse(OccupancyPeriod p) {
        return OccupancyPeriodResponse.builder()
                .id(p.getId())
                .roomId(p.getRoomId())
                .propertyId(p.getPropertyId())
                .startMonth(p.getStartMonth())
                .startYear(p.getStartYear())
                .endMonth(p.getEndMonth())
                .endYear(p.getEndYear())
                .depositAmount(p.getDepositAmount())
                .depositDate(p.getDepositDate())
                .paymentDay(p.getPaymentDay())
                .contractUrl(p.getContractUrl())
                .finalElecReading(p.getFinalElecReading())
                .finalWaterReading(p.getFinalWaterReading())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private OccupancyPeriodOccupantResponse toPeriodOccupantResponse(OccupancyPeriodOccupant o) {
        return OccupancyPeriodOccupantResponse.builder()
                .id(o.getId())
                .periodId(o.getPeriodId())
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
