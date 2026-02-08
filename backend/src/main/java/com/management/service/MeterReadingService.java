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
    public MeterReading create(Long propertyId, Long roomId, MeterReadingRequest request) {
        ensurePropertyOwnedByCurrentUser(propertyId);
        Room room = roomRepository.findByIdAndPropertyId(roomId, propertyId)
                .orElseThrow(() -> new RoomNotFoundException("Room not found: " + roomId));
        if (room.getStatus() != RoomStatus.OCCUPIED) {
            throw new IllegalStateException("Chỉ được cập nhật chỉ số điện nước khi phòng đang cho thuê.");
        }
        MeterReading reading = meterReadingRepository.findByRoomIdAndMonthAndYear(roomId, request.getMonth(), request.getYear())
                .orElse(MeterReading.builder()
                        .roomId(roomId)
                        .month(request.getMonth())
                        .year(request.getYear())
                        .elecReading(request.getElecReading())
                        .waterReading(request.getWaterReading())
                        .build());
        reading.setElecReading(request.getElecReading());
        reading.setWaterReading(request.getWaterReading());
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
