package com.management.service;

import com.management.domain.entity.MeterReading;
import com.management.domain.entity.Room;
import com.management.domain.enums.RoomStatus;
import com.management.dto.request.MeterReadingRequest;
import com.management.exception.PropertyNotFoundException;
import com.management.exception.RoomNotFoundException;
import com.management.repository.MeterReadingRepository;
import com.management.repository.PropertyRepository;
import com.management.repository.RoomRepository;
import com.management.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class MeterReadingService {

    private final MeterReadingRepository meterReadingRepository;
    private final RoomRepository roomRepository;
    private final PropertyRepository propertyRepository;

    public MeterReading getByRoomAndMonthYear(Long propertyId, Long roomId, int month, int year) {
        ensurePropertyOwnedByCurrentUser(propertyId);
        if (!roomRepository.findByIdAndPropertyId(roomId, propertyId).isPresent()) {
            throw new RoomNotFoundException("Room not found: " + roomId);
        }
        return meterReadingRepository.findByRoomIdAndMonthAndYear(roomId, month, year)
                .orElse(null);
    }

    @Transactional
    public MeterReading create(Long propertyId, Long roomId, MeterReadingRequest meterReadingRequest) {
        ensurePropertyOwnedByCurrentUser(propertyId);
        Room room = roomRepository.findByIdAndPropertyId(roomId, propertyId)
                .orElseThrow(() -> new RoomNotFoundException("Room not found: " + roomId));
        if (room.getStatus() != RoomStatus.OCCUPIED) {
            throw new IllegalStateException("Chỉ được cập nhật chỉ số điện nước khi phòng đang cho thuê.");
        }
        int prevMonth = meterReadingRequest.getMonth() == 1 ? 12 : meterReadingRequest.getMonth() - 1;
        int prevYear = meterReadingRequest.getMonth() == 1 ? meterReadingRequest.getYear() - 1 : meterReadingRequest.getYear();
        BigDecimal prevElec = meterReadingRepository.findByRoomIdAndMonthAndYear(roomId, prevMonth, prevYear)
                .map(MeterReading::getElecReading)
                .orElse(BigDecimal.ZERO);
        BigDecimal prevWater = meterReadingRepository.findByRoomIdAndMonthAndYear(roomId, prevMonth, prevYear)
                .map(MeterReading::getWaterReading)
                .orElse(BigDecimal.ZERO);
        BigDecimal initialElec = room.getInitialElecReading() != null ? room.getInitialElecReading() : BigDecimal.ZERO;
        BigDecimal initialWater = room.getInitialWaterReading() != null ? room.getInitialWaterReading() : BigDecimal.ZERO;
        BigDecimal minElec = prevElec.max(initialElec);
        BigDecimal minWater = prevWater.max(initialWater);
        if (meterReadingRequest.getElecReading().compareTo(minElec) < 0 || meterReadingRequest.getWaterReading().compareTo(minWater) < 0) {
            throw new IllegalArgumentException("Chỉ số điện nước không được nhỏ hơn chỉ số lúc chuyển trạng thái hoặc chỉ số tháng trước.");
        }
        MeterReading reading = meterReadingRepository.findByRoomIdAndMonthAndYear(roomId, meterReadingRequest.getMonth(), meterReadingRequest.getYear())
                .orElse(MeterReading.builder()
                        .roomId(roomId)
                        .month(meterReadingRequest.getMonth())
                        .year(meterReadingRequest.getYear())
                        .elecReading(meterReadingRequest.getElecReading())
                        .waterReading(meterReadingRequest.getWaterReading())
                        .build());
        reading.setElecReading(meterReadingRequest.getElecReading());
        reading.setWaterReading(meterReadingRequest.getWaterReading());
        return meterReadingRepository.save(reading);
    }

    private void ensurePropertyOwnedByCurrentUser(Long propertyId) {
        long userId = currentUserId();
        if (!propertyRepository.existsByIdAndOwnerUserId(propertyId, userId)) {
            throw new PropertyNotFoundException("Property not found: " + propertyId);
        }
    }

    private long currentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getUser().getId();
    }
}
