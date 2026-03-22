package com.management.service;

import com.management.domain.entity.Tenant;
import com.management.dto.request.CreateTenantRequest;
import com.management.util.Text;
import com.management.dto.request.UpdateTenantRequest;
import com.management.dto.response.TenantResponse;
import com.management.exception.TenantNotFoundException;
import com.management.repository.TenantRepository;
import com.management.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;

    public List<TenantResponse> listByCurrentUser() {
        long userId = currentUserId();
        return tenantRepository.findByOwnerUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TenantResponse getById(Long id) {
        long userId = currentUserId();
        Tenant tenant = tenantRepository.findByIdAndOwnerUserId(id, userId)
                .orElseThrow(() -> new TenantNotFoundException("Không tìm thấy người thuê: " + id));
        return toResponse(tenant);
    }

    @Transactional
    public TenantResponse create(CreateTenantRequest createTenantRequest) {
        long userId = currentUserId();
        Tenant tenant = Tenant.builder()
                .ownerUserId(userId)
                .fullName(createTenantRequest.getFullName().trim())
                .phone(Text.trimToNull(createTenantRequest.getPhone()))
                .idNumber(Text.trimToNull(createTenantRequest.getIdNumber()))
                .idType(Text.trimToNull(createTenantRequest.getIdType()))
                .address(Text.trimToNull(createTenantRequest.getAddress()))
                .build();
        tenant = tenantRepository.save(tenant);
        return toResponse(tenant);
    }

    @Transactional
    public TenantResponse update(Long id, UpdateTenantRequest updateTenantRequest) {
        long userId = currentUserId();
        Tenant tenant = tenantRepository.findByIdAndOwnerUserId(id, userId)
                .orElseThrow(() -> new TenantNotFoundException("Không tìm thấy người thuê: " + id));
        tenant.setFullName(updateTenantRequest.getFullName().trim());
        tenant.setPhone(Text.trimToNull(updateTenantRequest.getPhone()));
        tenant.setIdNumber(Text.trimToNull(updateTenantRequest.getIdNumber()));
        tenant.setIdType(Text.trimToNull(updateTenantRequest.getIdType()));
        tenant.setAddress(Text.trimToNull(updateTenantRequest.getAddress()));
        tenant = tenantRepository.save(tenant);
        return toResponse(tenant);
    }

    @Transactional
    public void delete(Long id) {
        long userId = currentUserId();
        if (!tenantRepository.findByIdAndOwnerUserId(id, userId).isPresent()) {
            throw new TenantNotFoundException("Không tìm thấy người thuê: " + id);
        }
        tenantRepository.deleteById(id);
    }

    boolean isTenantOwnedByCurrentUser(Long tenantId) {
        if (tenantId == null) return false;
        return tenantRepository.findByIdAndOwnerUserId(tenantId, currentUserId()).isPresent();
    }

    private TenantResponse toResponse(Tenant t) {
        return TenantResponse.builder()
                .id(t.getId())
                .ownerUserId(t.getOwnerUserId())
                .fullName(t.getFullName())
                .phone(t.getPhone())
                .idNumber(t.getIdNumber())
                .idType(t.getIdType())
                .address(t.getAddress())
                .createdAt(t.getCreatedAt())
                .build();
    }

    private long currentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal.getUser().getId();
    }
}
