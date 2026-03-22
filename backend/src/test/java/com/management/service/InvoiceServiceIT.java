package com.management.service;

import com.management.AbstractPostgreSQLTest;
import com.management.domain.entity.Invoice;
import com.management.domain.entity.Property;
import com.management.domain.entity.Room;
import com.management.domain.entity.User;
import com.management.domain.enums.InvoiceStatus;
import com.management.domain.enums.RoomStatus;
import com.management.domain.enums.UserRole;
import com.management.domain.enums.UserStatus;
import com.management.dto.response.InvoiceResponse;
import com.management.repository.InvoiceRepository;
import com.management.repository.PropertyRepository;
import com.management.repository.RoomRepository;
import com.management.repository.UserRepository;
import com.management.security.UserPrincipal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Guards {@link InvoiceService#getById(Long)} and {@link InvoiceService#list} bulk room/property
 * loading so responses include names and unit prices without N+1 regressions.
 */
class InvoiceServiceIT extends AbstractPostgreSQLTest {

    private static final int MONTH = 6;
    private static final int YEAR = 2099;

    @Autowired
    private InvoiceService invoiceService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PropertyRepository propertyRepository;
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private InvoiceRepository invoiceRepository;

    private User owner;
    private Property property;

    @BeforeEach
    void setUp() {
        owner = userRepository.save(User.builder()
                .username("invoice-it-owner")
                .email("invoice-it-owner@example.com")
                .password("{noop}ignored")
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build());
        authenticate(owner);
        property = propertyRepository.save(Property.builder()
                .ownerUserId(owner.getId())
                .name("Building IT")
                .address("Test lane")
                .elecPrice(new BigDecimal("3500.00"))
                .waterPrice(new BigDecimal("18000.50"))
                .build());
    }

    @AfterEach
    void tearDownSecurity() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @Transactional
    void getById_populatesRoomPropertyNamesAndUnitPrices() {
        Room room = roomRepository.save(Room.builder()
                .propertyId(property.getId())
                .name("Room A")
                .rentPrice(new BigDecimal("5000000"))
                .status(RoomStatus.OCCUPIED)
                .paymentDay(10)
                .fixedElecAmount(new BigDecimal("100000"))
                .fixedWaterAmount(new BigDecimal("80000"))
                .build());
        Invoice inv = invoiceRepository.save(Invoice.builder()
                .roomId(room.getId())
                .month(MONTH)
                .year(YEAR)
                .dueDate(LocalDate.of(YEAR, MONTH, 10))
                .rentAmount(new BigDecimal("5000000"))
                .elecAmount(new BigDecimal("100000"))
                .waterAmount(new BigDecimal("80000"))
                .otherAmount(BigDecimal.ZERO)
                .totalAmount(new BigDecimal("5280000"))
                .status(InvoiceStatus.UNPAID)
                .build());

        InvoiceResponse r = invoiceService.getById(inv.getId());

        assertThat(r.getRoomName()).isEqualTo("Room A");
        assertThat(r.getPropertyName()).isEqualTo("Building IT");
        assertThat(r.getPropertyId()).isEqualTo(property.getId());
        assertThat(r.getElecUnitPrice()).isEqualByComparingTo("3500.00");
        assertThat(r.getWaterUnitPrice()).isEqualByComparingTo("18000.50");
    }

    @Test
    @Transactional
    void list_populatesEachInvoiceWithMatchingRoomAndProperty() {
        Room r1 = roomRepository.save(Room.builder()
                .propertyId(property.getId())
                .name("North")
                .rentPrice(new BigDecimal("4000000"))
                .status(RoomStatus.OCCUPIED)
                .paymentDay(5)
                .fixedElecAmount(BigDecimal.ONE)
                .fixedWaterAmount(BigDecimal.ONE)
                .build());
        Room r2 = roomRepository.save(Room.builder()
                .propertyId(property.getId())
                .name("South")
                .rentPrice(new BigDecimal("4500000"))
                .status(RoomStatus.OCCUPIED)
                .paymentDay(5)
                .fixedElecAmount(BigDecimal.ONE)
                .fixedWaterAmount(BigDecimal.ONE)
                .build());
        invoiceRepository.save(Invoice.builder()
                .roomId(r1.getId())
                .month(MONTH)
                .year(YEAR)
                .dueDate(LocalDate.of(YEAR, MONTH, 5))
                .rentAmount(new BigDecimal("4000000"))
                .elecAmount(BigDecimal.ONE)
                .waterAmount(BigDecimal.ONE)
                .otherAmount(BigDecimal.ZERO)
                .totalAmount(new BigDecimal("4000002"))
                .status(InvoiceStatus.UNPAID)
                .build());
        invoiceRepository.save(Invoice.builder()
                .roomId(r2.getId())
                .month(MONTH)
                .year(YEAR)
                .dueDate(LocalDate.of(YEAR, MONTH, 5))
                .rentAmount(new BigDecimal("4500000"))
                .elecAmount(BigDecimal.ONE)
                .waterAmount(BigDecimal.ONE)
                .otherAmount(BigDecimal.ZERO)
                .totalAmount(new BigDecimal("4500002"))
                .status(InvoiceStatus.UNPAID)
                .build());

        List<InvoiceResponse> list = invoiceService.list(MONTH, YEAR, null, null);

        assertThat(list).hasSize(2);
        assertThat(list)
                .extracting(InvoiceResponse::getRoomName)
                .containsExactlyInAnyOrder("North", "South");
        assertThat(list)
                .extracting(InvoiceResponse::getPropertyName)
                .containsOnly("Building IT");
    }

    private static void authenticate(User user) {
        UserPrincipal principal = new UserPrincipal(user);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
    }
}
