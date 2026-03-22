package com.management.service;

import com.management.domain.entity.Invoice;
import com.management.domain.entity.MeterReading;
import com.management.domain.entity.Occupant;
import com.management.domain.entity.Property;
import com.management.domain.entity.Room;
import com.management.domain.enums.InvoiceStatus;
import com.management.domain.enums.RoomStatus;
import com.management.dto.request.MarkPaidRequest;
import com.management.dto.response.InvoiceResponse;
import com.management.exception.InvoiceAlreadyPaidException;
import com.management.exception.InvoiceNotFoundException;
import com.management.exception.PropertyNotFoundException;
import com.management.exception.RoomNotFoundException;
import com.management.repository.InvoiceRepository;
import com.management.repository.MeterReadingRepository;
import com.management.repository.OccupantRepository;
import com.management.repository.PropertyRepository;
import com.management.repository.RoomRepository;
import com.management.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final RoomRepository roomRepository;
    private final PropertyRepository propertyRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final OccupantRepository occupantRepository;
    private final ZaloNotificationService zaloNotificationService;

    @Transactional
    public InvoiceResponse generate(Long propertyId, Long roomId, int month, int year) {
        long userId = currentUserId();
        Long actualPropertyId = getPropertyIdForRoom(roomId);
        if (!Objects.equals(actualPropertyId, propertyId)) {
            throw new RoomNotFoundException("Room not found for property");
        }
        return generateForOwner(roomId, month, year, userId);
    }

    /** Used by scheduled job and by generate() - creates invoice for room/month/year for the given owner. */
    @Transactional
    public InvoiceResponse generateForOwner(Long roomId, int month, int year, long ownerUserId) {
        Long propertyId = getPropertyIdForRoom(roomId);
        if (!propertyRepository.existsByIdAndOwnerUserId(propertyId, ownerUserId)) {
            throw new PropertyNotFoundException("Property not found");
        }
        Room room = roomRepository.findByIdAndPropertyId(roomId, propertyId)
                .orElseThrow(() -> new RoomNotFoundException("Room not found: " + roomId));
        if (room.getStatus() != RoomStatus.OCCUPIED) {
            throw new IllegalStateException("Chỉ được tạo hóa đơn khi phòng đang cho thuê.");
        }
        Property property = propertyRepository.findByIdAndOwnerUserId(room.getPropertyId(), ownerUserId)
                .orElseThrow(() -> new PropertyNotFoundException("Property not found: " + room.getPropertyId()));

        BigDecimal rentAmount = room.getRentPrice() != null ? room.getRentPrice() : BigDecimal.ZERO;
        BigDecimal elecAmount;
        BigDecimal waterAmount;
        BigDecimal elecConsumption = null;
        BigDecimal waterConsumption = null;
        boolean useFixedUtility = room.getFixedElecAmount() != null && room.getFixedWaterAmount() != null;
        if (useFixedUtility) {
            elecAmount = room.getFixedElecAmount().setScale(2, RoundingMode.HALF_UP);
            waterAmount = room.getFixedWaterAmount().setScale(2, RoundingMode.HALF_UP);
        } else {
            MeterReading currentReading = meterReadingRepository.findByRoomIdAndMonthAndYear(roomId, month, year)
                    .orElseThrow(() -> new IllegalStateException("Chỉ số điện nước tháng " + month + "/" + year + " chưa có. Vui lòng nhập chỉ số đồng hồ trước."));
            BigDecimal initialElec = room.getInitialElecReading() != null ? room.getInitialElecReading() : BigDecimal.ZERO;
            BigDecimal initialWater = room.getInitialWaterReading() != null ? room.getInitialWaterReading() : BigDecimal.ZERO;
            if (currentReading.getElecReading().compareTo(initialElec) < 0 || currentReading.getWaterReading().compareTo(initialWater) < 0) {
                throw new IllegalArgumentException("Chỉ số điện nước không được nhỏ hơn chỉ số lúc chuyển trạng thái.");
            }
            int prevMonth = month == 1 ? 12 : month - 1;
            int prevYear = month == 1 ? year - 1 : year;
            // Chỉ dùng chỉ số tháng trước khi đã có hóa đơn tháng trước (đã từng tính tiền tháng đó).
            // Tháng đầu cho thuê không có hóa đơn tháng trước → dùng chỉ số init của phòng, tránh điện/nước ra 0đ.
            boolean hasPrevInvoice = invoiceRepository.findByRoomIdAndMonthAndYear(roomId, prevMonth, prevYear).isPresent();
            var prevReading = hasPrevInvoice ? meterReadingRepository.findByRoomIdAndMonthAndYear(roomId, prevMonth, prevYear) : Optional.<MeterReading>empty();
            BigDecimal elecOld = prevReading.map(MeterReading::getElecReading)
                    .orElse(room.getInitialElecReading() != null ? room.getInitialElecReading() : BigDecimal.ZERO);
            BigDecimal waterOld = prevReading.map(MeterReading::getWaterReading)
                    .orElse(room.getInitialWaterReading() != null ? room.getInitialWaterReading() : BigDecimal.ZERO);
            BigDecimal elecPrice = property.getElecPrice() != null ? property.getElecPrice() : BigDecimal.ZERO;
            BigDecimal waterPrice = property.getWaterPrice() != null ? property.getWaterPrice() : BigDecimal.ZERO;
            BigDecimal elecDelta = currentReading.getElecReading().subtract(elecOld).max(BigDecimal.ZERO);
            BigDecimal waterDelta = currentReading.getWaterReading().subtract(waterOld).max(BigDecimal.ZERO);
            elecConsumption = elecDelta;
            waterConsumption = waterDelta;
            elecAmount = elecDelta.multiply(elecPrice).setScale(2, RoundingMode.HALF_UP);
            waterAmount = waterDelta.multiply(waterPrice).setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal otherAmount = BigDecimal.ZERO;
        BigDecimal totalAmount = rentAmount.add(elecAmount).add(waterAmount).add(otherAmount).setScale(2, RoundingMode.HALF_UP);

        int dueDay = room.getPaymentDay() != null
                ? Math.min(room.getPaymentDay(), YearMonth.of(year, month).lengthOfMonth())
                : 1;
        LocalDate dueDate = LocalDate.of(year, month, dueDay);

        Invoice invoice = invoiceRepository.findByRoomIdAndMonthAndYear(roomId, month, year)
                .orElse(Invoice.builder()
                        .roomId(roomId)
                        .month(month)
                        .year(year)
                        .status(InvoiceStatus.UNPAID)
                        .otherAmount(BigDecimal.ZERO)
                        .build());
        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new InvoiceAlreadyPaidException("Hóa đơn đã thanh toán, không thể chỉnh sửa.");
        }
        invoice.setDueDate(dueDate);
        invoice.setRentAmount(rentAmount);
        invoice.setElecAmount(elecAmount);
        invoice.setWaterAmount(waterAmount);
        invoice.setElecConsumption(elecConsumption);
        invoice.setWaterConsumption(waterConsumption);
        invoice.setOtherAmount(otherAmount);
        invoice.setTotalAmount(totalAmount);
        invoice = invoiceRepository.save(invoice);
        return toResponseWithRoomAndPropertyMaps(invoice);
    }

    public List<InvoiceResponse> list(Integer month, Integer year, Long propertyId, InvoiceStatus status) {
        long userId = currentUserId();
        List<Invoice> list = invoiceRepository.findForOwner(userId, year, month, propertyId, status);
        if (list.isEmpty()) {
            return List.of();
        }
        Set<Long> roomIds = list.stream().map(Invoice::getRoomId).collect(Collectors.toSet());
        Map<Long, Room> roomMap = roomRepository.findAllById(roomIds).stream().collect(Collectors.toMap(Room::getId, r -> r));
        Set<Long> propIds = roomMap.values().stream().map(Room::getPropertyId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<Long, Property> propMap = propIds.isEmpty() ? Map.of() : propertyRepository.findAllById(propIds).stream().collect(Collectors.toMap(Property::getId, p -> p));
        return list.stream().map(i -> toResponse(i, roomMap, propMap)).collect(Collectors.toList());
    }

    public InvoiceResponse getById(Long id) {
        long userId = currentUserId();
        Invoice invoice = invoiceRepository.findByIdAndOwnerUserId(id, userId)
                .orElseThrow(() -> new InvoiceNotFoundException("Invoice not found: " + id));
        return toResponseWithRoomAndPropertyMaps(invoice);
    }

    @Transactional
    public InvoiceResponse markPaid(Long id, MarkPaidRequest markPaidRequest) {
        long userId = currentUserId();
        Invoice invoice = invoiceRepository.findByIdAndOwnerUserId(id, userId)
                .orElseThrow(() -> new InvoiceNotFoundException("Invoice not found: " + id));
        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaidAt(markPaidRequest.getPaidAt());
        invoice.setPaymentMethod(markPaidRequest.getPaymentMethod());
        invoice = invoiceRepository.save(invoice);
        return toResponseWithRoomAndPropertyMaps(invoice);
    }

    @Transactional
    public InvoiceResponse markUnpaid(Long id) {
        long userId = currentUserId();
        Invoice invoice = invoiceRepository.findByIdAndOwnerUserId(id, userId)
                .orElseThrow(() -> new InvoiceNotFoundException("Invoice not found: " + id));
        invoice.setStatus(InvoiceStatus.UNPAID);
        invoice.setPaidAt(null);
        invoice.setPaymentMethod(null);
        invoice = invoiceRepository.save(invoice);
        return toResponseWithRoomAndPropertyMaps(invoice);
    }

    /** Xóa hóa đơn chỉ khi chưa thanh toán (UNPAID). */
    @Transactional
    public void delete(Long id) {
        long userId = currentUserId();
        Invoice invoice = invoiceRepository.findByIdAndOwnerUserId(id, userId)
                .orElseThrow(() -> new InvoiceNotFoundException("Invoice not found: " + id));
        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new InvoiceAlreadyPaidException("Chỉ được xóa hóa đơn chưa thanh toán.");
        }
        invoiceRepository.delete(invoice);
    }

    /**
     * Gửi tin nhắn Zalo cho hóa đơn tới người nhận đã chọn trong phòng (template hóa đơn phòng trọ).
     * Người nhận: trong danh sách người ở của phòng, chọn 1 người làm người nhận Zalo và nhập Zalo User ID cho người đó.
     */
    public void sendInvoiceZalo(Long id) {
        long userId = currentUserId();
        Invoice invoice = invoiceRepository.findByIdAndOwnerUserId(id, userId)
                .orElseThrow(() -> new InvoiceNotFoundException("Invoice not found: " + id));
        Long roomId = invoice.getRoomId();
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new RoomNotFoundException("Room not found: " + roomId));
        Long recipientOccupantId = room.getInvoiceRecipientOccupantId();
        if (recipientOccupantId == null) {
            throw new IllegalStateException("Chưa chọn người nhận Zalo cho phòng này. Vào danh sách người ở của phòng để chọn người nhận và nhập Zalo User ID.");
        }
        Occupant recipient = occupantRepository.findByIdAndRoomId(recipientOccupantId, roomId)
                .orElseThrow(() -> new IllegalStateException("Người nhận Zalo không còn trong phòng."));
        String zaloUserId = recipient.getZaloUserId();
        if (zaloUserId == null || zaloUserId.isBlank()) {
            throw new IllegalStateException("Người nhận chưa có Zalo User ID. Vào danh sách người ở để nhập Zalo User ID cho người nhận.");
        }
        InvoiceResponse response = toResponseWithRoomAndPropertyMaps(invoice);
        String message = zaloNotificationService.buildInvoiceMessage(response, null);
        zaloNotificationService.sendMessage(zaloUserId.trim(), message);
    }

    private Long getPropertyIdForRoom(Long roomId) {
        return roomRepository.findById(roomId)
                .map(Room::getPropertyId)
                .orElseThrow(() -> new RoomNotFoundException("Room not found: " + roomId));
    }

    private long currentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getUser().getId();
    }

    /**
     * Loads room + property in bulk (same strategy as {@link #list}) to avoid chained {@code findById} calls per invoice.
     */
    private InvoiceResponse toResponseWithRoomAndPropertyMaps(Invoice invoice) {
        Long roomId = invoice.getRoomId();
        if (roomId == null) {
            return toResponse(invoice, Map.of(), Map.of());
        }
        Map<Long, Room> roomMap = roomRepository.findAllById(Set.of(roomId)).stream()
                .collect(Collectors.toMap(Room::getId, r -> r));
        Set<Long> propIds = roomMap.values().stream()
                .map(Room::getPropertyId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, Property> propMap = propIds.isEmpty()
                ? Map.of()
                : propertyRepository.findAllById(propIds).stream().collect(Collectors.toMap(Property::getId, p -> p));
        return toResponse(invoice, roomMap, propMap);
    }

    private InvoiceResponse toResponse(Invoice i, Map<Long, Room> roomMap, Map<Long, Property> propMap) {
        Room room = roomMap.get(i.getRoomId());
        String roomName = room != null ? room.getName() : "—";
        Long propId = room != null ? room.getPropertyId() : null;
        Property property = propId != null ? propMap.get(propId) : null;
        String propertyName = property != null ? property.getName() : "—";
        BigDecimal elecUnit = property != null && property.getElecPrice() != null ? property.getElecPrice() : null;
        BigDecimal waterUnit = property != null && property.getWaterPrice() != null ? property.getWaterPrice() : null;
        return buildResponse(i, roomName, propId, propertyName, elecUnit, waterUnit);
    }

    private static InvoiceResponse buildResponse(Invoice i, String roomName, Long propId, String propertyName,
                                                 BigDecimal elecUnitPrice, BigDecimal waterUnitPrice) {
        return InvoiceResponse.builder()
                .id(i.getId())
                .propertyId(propId)
                .propertyName(propertyName)
                .roomId(i.getRoomId())
                .roomName(roomName)
                .month(i.getMonth())
                .year(i.getYear())
                .dueDate(i.getDueDate())
                .rentAmount(i.getRentAmount())
                .elecAmount(i.getElecAmount())
                .waterAmount(i.getWaterAmount())
                .elecConsumption(i.getElecConsumption())
                .waterConsumption(i.getWaterConsumption())
                .elecUnitPrice(elecUnitPrice)
                .waterUnitPrice(waterUnitPrice)
                .otherAmount(i.getOtherAmount())
                .totalAmount(i.getTotalAmount())
                .status(i.getStatus())
                .paidAt(i.getPaidAt())
                .paymentMethod(i.getPaymentMethod())
                .createdAt(i.getCreatedAt())
                .build();
    }
}
