package com.management.controller;

import com.management.dto.request.CreateTenantRequest;
import com.management.dto.request.UpdateTenantRequest;
import com.management.dto.response.TenantResponse;
import com.management.service.TenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Tenants", description = "Người thuê (chủ hợp đồng)")
public class TenantController {

    private final TenantService tenantService;

    @GetMapping("/api/tenants")
    @Operation(summary = "Danh sách người thuê của chủ nhà")
    public ResponseEntity<List<TenantResponse>> list() {
        return ResponseEntity.ok(tenantService.listByCurrentUser());
    }

    @GetMapping("/api/tenants/{id}")
    @Operation(summary = "Chi tiết người thuê")
    public ResponseEntity<TenantResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(tenantService.getById(id));
    }

    @PostMapping("/api/tenants")
    @Operation(summary = "Tạo người thuê")
    public ResponseEntity<TenantResponse> create(@Valid @RequestBody CreateTenantRequest request) {
        TenantResponse created = tenantService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/api/tenants/{id}")
    @Operation(summary = "Cập nhật người thuê")
    public ResponseEntity<TenantResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTenantRequest request) {
        return ResponseEntity.ok(tenantService.update(id, request));
    }

    @DeleteMapping("/api/tenants/{id}")
    @Operation(summary = "Xóa người thuê")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tenantService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
