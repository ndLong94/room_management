package com.management.controller;

import com.management.dto.request.CreateRoomRequest;
import com.management.dto.request.UpdateRoomRequest;
import com.management.dto.response.RoomResponse;
import com.management.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties/{propertyId}/rooms")
@RequiredArgsConstructor
@Tag(name = "Rooms", description = "CRUD for rooms under a property (owner-scoped via property)")
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    @Operation(summary = "List rooms for a property")
    public ResponseEntity<List<RoomResponse>> list(@PathVariable Long propertyId) {
        return ResponseEntity.ok(roomService.listByProperty(propertyId));
    }

    @GetMapping("/{roomId}")
    @Operation(summary = "Get room by id")
    public ResponseEntity<RoomResponse> getById(@PathVariable Long propertyId, @PathVariable Long roomId) {
        return ResponseEntity.ok(roomService.getByPropertyAndId(propertyId, roomId));
    }

    @PostMapping
    @Operation(summary = "Create a room under the property")
    public ResponseEntity<RoomResponse> create(@PathVariable Long propertyId,
                                               @Valid @RequestBody CreateRoomRequest request) {
        RoomResponse created = roomService.create(propertyId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{roomId}")
    @Operation(summary = "Update a room")
    public ResponseEntity<RoomResponse> update(@PathVariable Long propertyId,
                                               @PathVariable Long roomId,
                                               @Valid @RequestBody UpdateRoomRequest request) {
        return ResponseEntity.ok(roomService.update(propertyId, roomId, request));
    }

    @DeleteMapping("/{roomId}")
    @Operation(summary = "Delete a room")
    public ResponseEntity<Void> delete(@PathVariable Long propertyId, @PathVariable Long roomId) {
        roomService.delete(propertyId, roomId);
        return ResponseEntity.noContent().build();
    }
}
