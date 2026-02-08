package com.management.batch;

import com.management.domain.entity.MeterReading;
import com.management.domain.entity.Property;
import com.management.domain.entity.Room;
import com.management.domain.enums.RoomStatus;
import com.management.repository.InvoiceRepository;
import com.management.repository.MeterReadingRepository;
import com.management.repository.PropertyRepository;
import com.management.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.batch.item.ItemStreamReader;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Reads rooms that need an invoice generated today (payment day, OCCUPIED, have meter reading, no invoice yet).
 */
@Component
@RequiredArgsConstructor
public class InvoiceJobItemReader implements ItemStreamReader<InvoiceJobItem> {

    private final RoomRepository roomRepository;
    private final PropertyRepository propertyRepository;
    private final InvoiceRepository invoiceRepository;
    private final MeterReadingRepository meterReadingRepository;

    private List<InvoiceJobItem> items;
    private int index;

    @Override
    public void open(ExecutionContext executionContext) {
        items = null;
        index = 0;
    }

    @Override
    public void update(ExecutionContext executionContext) {
    }

    @Override
    public void close() {
    }

    @Override
    public InvoiceJobItem read() {
        if (items == null) {
            items = buildItems();
            index = 0;
        }
        if (index >= items.size()) {
            return null;
        }
        return items.get(index++);
    }

    private List<InvoiceJobItem> buildItems() {
        int day = LocalDate.now().getDayOfMonth();
        int month = LocalDate.now().getMonthValue();
        int year = LocalDate.now().getYear();

        List<Room> rooms = roomRepository.findByPaymentDay(day);
        List<Room> occupied = rooms.stream().filter(r -> r.getStatus() == RoomStatus.OCCUPIED).toList();
        if (occupied.isEmpty()) {
            return List.of();
        }
        Set<Long> roomIds = occupied.stream().map(Room::getId).collect(Collectors.toSet());
        Set<Long> roomIdsWithInvoice = new HashSet<>(invoiceRepository.findRoomIdsWithInvoice(roomIds, month, year));
        Set<Long> roomIdsWithReading = meterReadingRepository.findByRoomIdInAndMonthAndYear(roomIds, month, year)
                .stream().map(MeterReading::getRoomId).collect(Collectors.toSet());
        Set<Long> propertyIds = occupied.stream().map(Room::getPropertyId).collect(Collectors.toSet());
        var propertyMap = propertyRepository.findAllById(propertyIds).stream().collect(Collectors.toMap(Property::getId, p -> p));

        List<InvoiceJobItem> result = new ArrayList<>();
        for (Room room : occupied) {
            if (roomIdsWithInvoice.contains(room.getId())) {
                continue;
            }
            if (!roomIdsWithReading.contains(room.getId())) {
                continue;
            }
            Property property = propertyMap.get(room.getPropertyId());
            if (property == null) {
                continue;
            }
            result.add(InvoiceJobItem.builder()
                    .roomId(room.getId())
                    .month(month)
                    .year(year)
                    .ownerUserId(property.getOwnerUserId())
                    .build());
        }
        return result;
    }
}
