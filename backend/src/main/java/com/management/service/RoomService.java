package com.management.service;

import com.management.domain.entity.MeterReading;
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
import com.management.repository.MeterReadingRepository;
import com.management.repository.OccupancyPeriodOccupantRepository;
import com.management.repository.OccupancyPeriodRepository;
import com.management.repository.OccupantRepository;
import com.management.repository.PropertyRepository;
import com.management.repository.RoomRepository;
import com.management.security.UserPrincipal;
import com.management.util.Text;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final MeterReadingRepository meterReadingRepository;
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
    public RoomResponse create(Long propertyId, CreateRoomRequest createRoomRequest) {
        ensurePropertyOwnedByCurrentUser(propertyId);
        Room room = Room.builder()
                .propertyId(propertyId)
                .name(createRoomRequest.getName().trim())
                .rentPrice(createRoomRequest.getRentPrice() != null ? createRoomRequest.getRentPrice() : BigDecimal.ZERO)
                .status(createRoomRequest.getStatus() != null ? createRoomRequest.getStatus() : RoomStatus.VACANT)
                .paymentDay(createRoomRequest.getPaymentDay())
                .depositAmount(createRoomRequest.getDepositAmount())
                .depositDate(createRoomRequest.getDepositDate())
                .depositPaid(createRoomRequest.getDepositPaid() != null ? createRoomRequest.getDepositPaid() : false)
                .fixedElecAmount(createRoomRequest.getFixedElecAmount())
                .fixedWaterAmount(createRoomRequest.getFixedWaterAmount())
                .initialElecReading(createRoomRequest.getInitialElecReading())
                .initialWaterReading(createRoomRequest.getInitialWaterReading())
                .build();
        room = roomRepository.save(room);
        return toResponse(room);
    }

    @Transactional
    public RoomResponse update(Long propertyId, Long roomId, UpdateRoomRequest updateRoomRequest) {
        ensurePropertyOwnedByCurrentUser(propertyId);
        Room room = roomRepository.findByIdAndPropertyId(roomId, propertyId)
                .orElseThrow(() -> new RoomNotFoundException("Room not found: " + roomId));
        RoomStatus newStatus = updateRoomRequest.getStatus();
        if (newStatus == RoomStatus.VACANT && room.getStatus() == RoomStatus.OCCUPIED) {
            archiveOccupantsAndVacate(propertyId, roomId, room);
        }
        room.setName(updateRoomRequest.getName().trim());
        room.setRentPrice(updateRoomRequest.getRentPrice() != null ? updateRoomRequest.getRentPrice() : BigDecimal.ZERO);
        room.setStatus(newStatus);
        if (newStatus == RoomStatus.VACANT) {
            room.setContractUrl(null);
            room.setPaymentDay(null);
            room.setDepositAmount(null);
            room.setDepositDate(null);
            room.setDepositPaid(false);
        } else {
            room.setContractUrl(Text.trimToNull(updateRoomRequest.getContractUrl()));
            room.setPaymentDay(updateRoomRequest.getPaymentDay());
            room.setDepositAmount(updateRoomRequest.getDepositAmount());
            room.setDepositDate(updateRoomRequest.getDepositDate());
            // Set depositPaid: if null in request, keep existing value; otherwise update (including false)
            if (updateRoomRequest.getDepositPaid() != null) {
                room.setDepositPaid(updateRoomRequest.getDepositPaid());
            } else {
                // If depositPaid is not provided in request, default to false if depositAmount is set, otherwise keep existing
                if (updateRoomRequest.getDepositAmount() != null && room.getDepositPaid() == null) {
                    room.setDepositPaid(false);
                }
            }
        }
        room.setFixedElecAmount(updateRoomRequest.getFixedElecAmount());
        room.setFixedWaterAmount(updateRoomRequest.getFixedWaterAmount());
        if (updateRoomRequest.getInitialElecReading() != null) room.setInitialElecReading(updateRoomRequest.getInitialElecReading());
        if (updateRoomRequest.getInitialWaterReading() != null) room.setInitialWaterReading(updateRoomRequest.getInitialWaterReading());
        Long recipientId = updateRoomRequest.getInvoiceRecipientOccupantId();
        if (recipientId != null && !occupantRepository.findByIdAndRoomId(recipientId, roomId).isPresent()) {
            throw new IllegalArgumentException("Người nhận Zalo phải là người ở trong phòng này.");
        }
        room.setInvoiceRecipientOccupantId(recipientId);
        room = roomRepository.save(room);
        return toResponse(room);
    }

    /** When switching room from OCCUPIED to VACANT: create occupancy period (snapshot incl. deposit/contract), delete occupants, clear room deposit/contract. */
    private void archiveOccupantsAndVacate(Long propertyId, Long roomId, Room room) {
        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();
        
        // Lấy số điện nước cuối cùng của phòng
        // Ưu tiên: 1) Meter reading tháng hiện tại, 2) Meter reading gần nhất, 3) Initial readings của phòng
        BigDecimal finalElecReading = null;
        BigDecimal finalWaterReading = null;
        
        // Thử lấy meter reading của tháng hiện tại trước
        Optional<MeterReading> currentMonthReading =
                meterReadingRepository.findByRoomIdAndMonthAndYear(roomId, currentMonth, currentYear);
        
        if (currentMonthReading.isPresent()) {
            // Có meter reading của tháng hiện tại → dùng
            finalElecReading = currentMonthReading.get().getElecReading();
            finalWaterReading = currentMonthReading.get().getWaterReading();
        } else {
            // Không có meter reading tháng hiện tại → lấy meter reading gần nhất
            List<MeterReading> latestReadings =
                    meterReadingRepository.findByRoomIdOrderByYearDescMonthDesc(roomId);
            if (!latestReadings.isEmpty()) {
                MeterReading latest = latestReadings.get(0);
                finalElecReading = latest.getElecReading();
                finalWaterReading = latest.getWaterReading();
            } else {
                // Không có meter reading nào → lấy từ initial readings của phòng (nếu có)
                if (room.getInitialElecReading() != null) {
                    finalElecReading = room.getInitialElecReading();
                }
                if (room.getInitialWaterReading() != null) {
                    finalWaterReading = room.getInitialWaterReading();
                }
            }
        }
        
        OccupancyPeriod period = OccupancyPeriod.builder()
                .roomId(roomId)
                .propertyId(propertyId)
                .startMonth(null)
                .startYear(null)
                .endMonth(now.getMonthValue())
                .endYear(now.getYear())
                .depositAmount(room.getDepositAmount())
                .depositDate(room.getDepositDate())
                .paymentDay(room.getPaymentDay())
                .contractUrl(room.getContractUrl())
                .finalElecReading(finalElecReading)
                .finalWaterReading(finalWaterReading)
                .build();
        period = occupancyPeriodRepository.save(period);
        List<Occupant> occupants = occupantRepository.findByRoomIdOrderByCreatedAtDesc(roomId);
        for (Occupant occupant : occupants) {
            OccupancyPeriodOccupant po = OccupancyPeriodOccupant.builder()
                    .periodId(period.getId())
                    .fullName(occupant.getFullName())
                    .phone(occupant.getPhone())
                    .idNumber(occupant.getIdNumber())
                    .idType(occupant.getIdType())
                    .address(occupant.getAddress())
                    .dob(occupant.getDob())
                    .avatarUrl(occupant.getAvatarUrl())
                    .idFrontUrl(occupant.getIdFrontUrl())
                    .idBackUrl(occupant.getIdBackUrl())
                    .tempResidenceUrl(occupant.getTempResidenceUrl())
                    .note(occupant.getNote())
                    .build();
            occupancyPeriodOccupantRepository.save(po);
        }
        if (!occupants.isEmpty()) {
            occupantRepository.deleteAll(occupants);
        }
        room.setDepositAmount(null);
        room.setDepositDate(null);
        room.setPaymentDay(null);
        room.setContractUrl(null);
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
                .depositAmount(r.getDepositAmount())
                .depositDate(r.getDepositDate())
                .depositPaid(r.getDepositPaid() != null ? r.getDepositPaid() : false)
                .fixedElecAmount(r.getFixedElecAmount())
                .fixedWaterAmount(r.getFixedWaterAmount())
                .initialElecReading(r.getInitialElecReading())
                .initialWaterReading(r.getInitialWaterReading())
                .invoiceRecipientOccupantId(r.getInvoiceRecipientOccupantId())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
