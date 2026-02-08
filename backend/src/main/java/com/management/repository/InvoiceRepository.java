package com.management.repository;

import com.management.domain.entity.Invoice;
import com.management.domain.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByRoomIdAndMonthAndYear(Long roomId, int month, int year);

    @Query("SELECT i FROM Invoice i JOIN Room r ON r.id = i.roomId JOIN Property p ON p.id = r.propertyId WHERE i.id = :id AND p.ownerUserId = :ownerUserId")
    Optional<Invoice> findByIdAndOwnerUserId(@Param("id") Long id, @Param("ownerUserId") Long ownerUserId);

    @Query("""
        SELECT i FROM Invoice i
        JOIN Room r ON r.id = i.roomId
        JOIN Property p ON p.id = r.propertyId
        WHERE p.ownerUserId = :ownerUserId
        AND ((:year IS NULL) OR (i.year = :year))
        AND ((:month IS NULL) OR (i.month = :month))
        AND ((:propertyId IS NULL) OR (r.propertyId = :propertyId))
        AND ((:status IS NULL) OR (i.status = :status))
        ORDER BY i.year DESC, i.month DESC, i.createdAt DESC
        """)
    List<Invoice> findForOwner(@Param("ownerUserId") Long ownerUserId,
                               @Param("year") Integer year,
                               @Param("month") Integer month,
                               @Param("propertyId") Long propertyId,
                               @Param("status") InvoiceStatus status);

    @Query("""
        SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i
        JOIN Room r ON r.id = i.roomId
        JOIN Property p ON p.id = r.propertyId
        WHERE p.ownerUserId = :ownerUserId AND i.month = :month AND i.year = :year AND i.status = 'UNPAID'
        """)
    BigDecimal sumUnpaidByOwnerAndMonthYear(@Param("ownerUserId") Long ownerUserId,
                                           @Param("month") int month,
                                           @Param("year") int year);

    @Query("""
        SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i
        JOIN Room r ON r.id = i.roomId
        JOIN Property p ON p.id = r.propertyId
        WHERE p.ownerUserId = :ownerUserId AND i.month = :month AND i.year = :year AND i.status = 'PAID'
        """)
    BigDecimal sumPaidByOwnerAndMonthYear(@Param("ownerUserId") Long ownerUserId,
                                          @Param("month") int month,
                                          @Param("year") int year);
}
