package com.management.service;

import com.management.domain.PropertyPricingDefaults;
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
import com.management.util.Text;
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
    public PropertyResponse create(CreatePropertyRequest createPropertyRequest) {
        Long userId = currentUserId();
        BigDecimal elec = createPropertyRequest.getElecPrice();
        BigDecimal water = createPropertyRequest.getWaterPrice();
        if (elec == null || water == null) {
            var global = pricingSettingRepository.findByOwnerUserId(userId);
            if (elec == null) {
                elec = global.map(P -> P.getElecPrice() != null ? P.getElecPrice() : PropertyPricingDefaults.DEFAULT_ELEC_PRICE)
                        .orElse(PropertyPricingDefaults.DEFAULT_ELEC_PRICE);
            }
            if (water == null) {
                water = global.map(P -> P.getWaterPrice() != null ? P.getWaterPrice() : PropertyPricingDefaults.DEFAULT_WATER_PRICE)
                        .orElse(PropertyPricingDefaults.DEFAULT_WATER_PRICE);
            }
        }
        Property property = Property.builder()
                .ownerUserId(userId)
                .name(createPropertyRequest.getName().trim())
                .address(Text.trimToNull(createPropertyRequest.getAddress()))
                .note(createPropertyRequest.getNote())
                .elecPrice(elec)
                .waterPrice(water)
                .build();
        property = propertyRepository.save(property);
        return toResponse(property);
    }

    @Transactional
    public PropertyResponse update(Long id, UpdatePropertyRequest updatePropertyRequest) {
        Long userId = currentUserId();
        Property property = propertyRepository.findByIdAndOwnerUserId(id, userId)
                .orElseThrow(() -> new PropertyNotFoundException("Property not found: " + id));
        property.setName(updatePropertyRequest.getName().trim());
        property.setAddress(Text.trimToNull(updatePropertyRequest.getAddress()));
        property.setNote(updatePropertyRequest.getNote());
        if (updatePropertyRequest.getElecPrice() != null) property.setElecPrice(updatePropertyRequest.getElecPrice());
        if (updatePropertyRequest.getWaterPrice() != null) property.setWaterPrice(updatePropertyRequest.getWaterPrice());
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
