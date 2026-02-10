package com.management.controller;

import com.management.dto.request.CreateRoomLeaseRequest;
import com.management.dto.request.UpdateRoomLeaseRequest;
import com.management.dto.response.RoomLeaseResponse;
import com.management.service.RoomLeaseService;
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
@Tag(name = "Room Leases", description = "Hợp đồng thuê phòng")
public class RoomLeaseController {

    private final RoomLeaseService roomLeaseService;

    @GetMapping("/api/properties/{propertyId}/rooms/{roomId}/leases")
    @Operation(summary = "Danh sách hợp đồng thuê của phòng")
    public ResponseEntity<List<RoomLeaseResponse>> list(
            @PathVariable Long propertyId,
            @PathVariable Long roomId) {
        return ResponseEntity.ok(roomLeaseService.listByRoom(propertyId, roomId));
    }

    @GetMapping("/api/properties/{propertyId}/rooms/{roomId}/leases/active")
    @Operation(summary = "Hợp đồng thuê đang hiệu lực")
    public ResponseEntity<RoomLeaseResponse> getActive(
            @PathVariable Long propertyId,
            @PathVariable Long roomId) {
        RoomLeaseResponse active = roomLeaseService.getActiveLease(propertyId, roomId);
        return active != null ? ResponseEntity.ok(active) : ResponseEntity.noContent().build();
    }

    @PostMapping("/api/properties/{propertyId}/rooms/{roomId}/leases")
    @Operation(summary = "Tạo hợp đồng thuê")
    public ResponseEntity<RoomLeaseResponse> create(
            @PathVariable Long propertyId,
            @PathVariable Long roomId,
            @Valid @RequestBody CreateRoomLeaseRequest request) {
        RoomLeaseResponse created = roomLeaseService.create(propertyId, roomId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/api/properties/{propertyId}/rooms/{roomId}/leases/{leaseId}")
    @Operation(summary = "Cập nhật hợp đồng thuê")
    public ResponseEntity<RoomLeaseResponse> update(
            @PathVariable Long propertyId,
            @PathVariable Long roomId,
            @PathVariable Long leaseId,
            @Valid @RequestBody UpdateRoomLeaseRequest request) {
        return ResponseEntity.ok(roomLeaseService.update(propertyId, roomId, leaseId, request));
    }

    @PostMapping("/api/properties/{propertyId}/rooms/{roomId}/leases/{leaseId}/end")
    @Operation(summary = "Kết thúc hợp đồng thuê")
    public ResponseEntity<Void> endLease(
            @PathVariable Long propertyId,
            @PathVariable Long roomId,
            @PathVariable Long leaseId) {
        roomLeaseService.endLease(propertyId, roomId, leaseId);
        return ResponseEntity.noContent().build();
    }
}
