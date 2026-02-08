package com.management.controller;

import com.management.dto.request.CreateOccupantRequest;
import com.management.dto.request.UpdateOccupantRequest;
import com.management.dto.response.OccupantResponse;
import com.management.service.OccupantService;
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
@Tag(name = "Occupants", description = "People living in a room (owner-scoped via room → property)")
public class OccupantController {

    private final OccupantService occupantService;

    @GetMapping("/api/properties/{propertyId}/rooms/{roomId}/occupants")
    @Operation(summary = "List occupants for a room")
    public ResponseEntity<List<OccupantResponse>> list(
            @PathVariable Long propertyId,
            @PathVariable Long roomId) {
        return ResponseEntity.ok(occupantService.listByRoom(propertyId, roomId));
    }

    @PostMapping("/api/properties/{propertyId}/rooms/{roomId}/occupants")
    @Operation(summary = "Add occupant to room")
    public ResponseEntity<OccupantResponse> create(
            @PathVariable Long propertyId,
            @PathVariable Long roomId,
            @Valid @RequestBody CreateOccupantRequest request) {
        OccupantResponse created = occupantService.create(propertyId, roomId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/api/occupants/{id}")
    @Operation(summary = "Get occupant by id")
    public ResponseEntity<OccupantResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(occupantService.getById(id));
    }

    @PutMapping("/api/occupants/{id}")
    @Operation(summary = "Update occupant")
    public ResponseEntity<OccupantResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOccupantRequest request) {
        return ResponseEntity.ok(occupantService.update(id, request));
    }

    @DeleteMapping("/api/occupants/{id}")
    @Operation(summary = "Delete occupant")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        occupantService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
