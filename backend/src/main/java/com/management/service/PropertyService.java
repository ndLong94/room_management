package com.management.service;

import com.management.domain.entity.Property;
import com.management.domain.enums.RoomStatus;
import com.management.dto.request.CreatePropertyRequest;
import com.management.dto.request.UpdatePropertyRequest;
import com.management.dto.response.PropertyResponse;
import com.management.exception.PropertyNotFoundException;
import com.management.repository.PricingSettingRepository;
import com.management.repository.PropertyRepository;
import com.management.repository.RoomRepository;
import com.management.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private static final BigDecimal DEFAULT_ELEC = new BigDecimal("3500");
    private static final BigDecimal DEFAULT_WATER = new BigDecimal("15000");

    private final PropertyRepository propertyRepository;
    private final PricingSettingRepository pricingSettingRepository;
    private final RoomRepository roomRepository;

    public List<PropertyResponse> findAllForCurrentUser() {
        Long userId = currentUserId();
        return propertyRepository.findAllByOwnerUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PropertyResponse findByIdForCurrentUser(Long id) {
        Long userId = currentUserId();
        Property property = propertyRepository.findByIdAndOwnerUserId(id, userId)
                .orElseThrow(() -> new PropertyNotFoundException("Property not found: " + id));
        return toResponse(property);
    }

    @Transactional
    public PropertyResponse create(CreatePropertyRequest request) {
        Long userId = currentUserId();
        BigDecimal elec = request.getElecPrice();
        BigDecimal water = request.getWaterPrice();
        if (elec == null || water == null) {
            var global = pricingSettingRepository.findByOwnerUserId(userId);
            if (elec == null) elec = global.map(P -> P.getElecPrice() != null ? P.getElecPrice() : DEFAULT_ELEC).orElse(DEFAULT_ELEC);
            if (water == null) water = global.map(P -> P.getWaterPrice() != null ? P.getWaterPrice() : DEFAULT_WATER).orElse(DEFAULT_WATER);
        }
        Property property = Property.builder()
                .ownerUserId(userId)
                .name(request.getName().trim())
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .note(request.getNote())
                .elecPrice(elec)
                .waterPrice(water)
                .build();
        property = propertyRepository.save(property);
        return toResponse(property);
    }

    @Transactional
    public PropertyResponse update(Long id, UpdatePropertyRequest request) {
        Long userId = currentUserId();
        Property property = propertyRepository.findByIdAndOwnerUserId(id, userId)
                .orElseThrow(() -> new PropertyNotFoundException("Property not found: " + id));
        property.setName(request.getName().trim());
        property.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);
        property.setNote(request.getNote());
        if (request.getElecPrice() != null) property.setElecPrice(request.getElecPrice());
        if (request.getWaterPrice() != null) property.setWaterPrice(request.getWaterPrice());
        property = propertyRepository.save(property);
        return toResponse(property);
    }

    @Transactional
    public void delete(Long id) {
        Long userId = currentUserId();
        if (!propertyRepository.existsByIdAndOwnerUserId(id, userId)) {
            throw new PropertyNotFoundException("Property not found: " + id);
        }
        // Check if property has any occupied rooms
        long occupiedCount = roomRepository.findByPropertyIdOrderByCreatedAtDesc(id)
                .stream()
                .filter(r -> r.getStatus() == RoomStatus.OCCUPIED)
                .count();
        if (occupiedCount > 0) {
            throw new IllegalStateException("Không thể xóa bất động sản khi có phòng đang cho thuê. Vui lòng chuyển trạng thái các phòng sang 'Còn trống' trước khi xóa.");
        }
        propertyRepository.deleteById(id);
    }

    private Long currentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getUser().getId();
    }

    private PropertyResponse toResponse(Property p) {
        return PropertyResponse.builder()
                .id(p.getId())
                .ownerUserId(p.getOwnerUserId())
                .name(p.getName())
                .address(p.getAddress())
                .note(p.getNote())
                .elecPrice(p.getElecPrice())
                .waterPrice(p.getWaterPrice())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
