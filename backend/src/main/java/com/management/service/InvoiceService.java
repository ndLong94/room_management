package com.management.service;

import com.management.domain.entity.Invoice;
import com.management.domain.entity.MeterReading;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final RoomRepository roomRepository;
    private final PropertyRepository propertyRepository;
    private final MeterReadingRepository meterReadingRepository;

    @Transactional
    public InvoiceResponse generate(Long roomId, int month, int year) {
        long userId = currentUserId();
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
        MeterReading currentReading = meterReadingRepository.findByRoomIdAndMonthAndYear(roomId, month, year)
                .orElseThrow(() -> new IllegalStateException("Meter reading for " + month + "/" + year + " not found. Add meter reading first."));

        int prevMonth = month == 1 ? 12 : month - 1;
        int prevYear = month == 1 ? year - 1 : year;
        BigDecimal elecOld = meterReadingRepository.findByRoomIdAndMonthAndYear(roomId, prevMonth, prevYear)
                .map(MeterReading::getElecReading)
                .orElse(BigDecimal.ZERO);
        BigDecimal waterOld = meterReadingRepository.findByRoomIdAndMonthAndYear(roomId, prevMonth, prevYear)
                .map(MeterReading::getWaterReading)
                .orElse(BigDecimal.ZERO);

        BigDecimal rentAmount = room.getRentPrice() != null ? room.getRentPrice() : BigDecimal.ZERO;
        BigDecimal elecPrice = property.getElecPrice() != null ? property.getElecPrice() : BigDecimal.ZERO;
        BigDecimal waterPrice = property.getWaterPrice() != null ? property.getWaterPrice() : BigDecimal.ZERO;
        BigDecimal elecDelta = currentReading.getElecReading().subtract(elecOld).max(BigDecimal.ZERO);
        BigDecimal waterDelta = currentReading.getWaterReading().subtract(waterOld).max(BigDecimal.ZERO);
        BigDecimal elecAmount = elecDelta.multiply(elecPrice).setScale(2, RoundingMode.HALF_UP);
        BigDecimal waterAmount = waterDelta.multiply(waterPrice).setScale(2, RoundingMode.HALF_UP);
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
        invoice.setOtherAmount(otherAmount);
        invoice.setTotalAmount(totalAmount);
        invoice = invoiceRepository.save(invoice);
        return toResponse(invoice);
    }

    public List<InvoiceResponse> list(Integer month, Integer year, Long propertyId, InvoiceStatus status) {
        long userId = currentUserId();
        List<Invoice> list = invoiceRepository.findForOwner(userId, year, month, propertyId, status);
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public InvoiceResponse getById(Long id) {
        long userId = currentUserId();
        Invoice invoice = invoiceRepository.findByIdAndOwnerUserId(id, userId)
                .orElseThrow(() -> new InvoiceNotFoundException("Invoice not found: " + id));
        return toResponse(invoice);
    }

    @Transactional
    public InvoiceResponse markPaid(Long id, MarkPaidRequest request) {
        long userId = currentUserId();
        Invoice invoice = invoiceRepository.findByIdAndOwnerUserId(id, userId)
                .orElseThrow(() -> new InvoiceNotFoundException("Invoice not found: " + id));
        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaidAt(request.getPaidAt());
        invoice.setPaymentMethod(request.getPaymentMethod());
        invoice = invoiceRepository.save(invoice);
        return toResponse(invoice);
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
        return toResponse(invoice);
    }

    private void ensureRoomOwnedByUser(Long roomId, long userId) {
        Long propertyId = getPropertyIdForRoom(roomId);
        if (!propertyRepository.existsByIdAndOwnerUserId(propertyId, userId)) {
            throw new PropertyNotFoundException("Property not found");
        }
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

    private InvoiceResponse toResponse(Invoice i) {
        Room room = roomRepository.findById(i.getRoomId()).orElse(null);
        String roomName = room != null ? room.getName() : "—";
        Long propId = room != null ? room.getPropertyId() : null;
        String propertyName = propId != null
                ? propertyRepository.findById(propId).map(Property::getName).orElse("—")
                : "—";
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
                .otherAmount(i.getOtherAmount())
                .totalAmount(i.getTotalAmount())
                .status(i.getStatus())
                .paidAt(i.getPaidAt())
                .paymentMethod(i.getPaymentMethod())
                .createdAt(i.getCreatedAt())
                .build();
    }
}
