package com.management.service;

import com.management.dto.response.DashboardSummaryResponse;
import com.management.repository.InvoiceRepository;
import com.management.repository.RoomRepository;
import com.management.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final RoomRepository roomRepository;
    private final InvoiceRepository invoiceRepository;

    public DashboardSummaryResponse getSummary(int month, int year) {
        long userId = currentUserId();
        long totalRooms = roomRepository.countByOwnerUserId(userId);
        long occupiedRooms = roomRepository.countOccupiedByOwnerUserId(userId);
        long vacantRooms = roomRepository.countVacantByOwnerUserId(userId);
        BigDecimal totalReceivable = invoiceRepository.sumUnpaidByOwnerAndMonthYear(userId, month, year);
        BigDecimal totalCollected = invoiceRepository.sumPaidByOwnerAndMonthYear(userId, month, year);
        if (totalReceivable == null) totalReceivable = BigDecimal.ZERO;
        if (totalCollected == null) totalCollected = BigDecimal.ZERO;
        return DashboardSummaryResponse.builder()
                .totalRooms(totalRooms)
                .occupiedRooms(occupiedRooms)
                .vacantRooms(vacantRooms)
                .totalReceivable(totalReceivable)
                .totalCollected(totalCollected)
                .build();
    }

    private long currentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getUser().getId();
    }
}
