package com.management.batch;

import com.management.domain.entity.Property;
import com.management.domain.entity.Room;
import com.management.domain.enums.RoomStatus;
import com.management.repository.InvoiceRepository;
import com.management.repository.MeterReadingRepository;
import com.management.repository.PropertyRepository;
import com.management.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemStream;
import org.springframework.batch.item.ItemStreamReader;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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
        List<InvoiceJobItem> result = new ArrayList<>();
        for (Room room : rooms) {
            if (room.getStatus() != RoomStatus.OCCUPIED) {
                continue;
            }
            if (invoiceRepository.findByRoomIdAndMonthAndYear(room.getId(), month, year).isPresent()) {
                continue;
            }
            if (meterReadingRepository.findByRoomIdAndMonthAndYear(room.getId(), month, year).isEmpty()) {
                continue;
            }
            Optional<Property> propertyOpt = propertyRepository.findById(room.getPropertyId());
            if (propertyOpt.isEmpty()) {
                continue;
            }
            Long ownerUserId = propertyOpt.get().getOwnerUserId();
            result.add(InvoiceJobItem.builder()
                    .roomId(room.getId())
                    .month(month)
                    .year(year)
                    .ownerUserId(ownerUserId)
                    .build());
        }
        return result;
    }
}
