package com.management.controller;

import com.management.dto.response.OccupancyPeriodOccupantResponse;
import com.management.dto.response.OccupancyPeriodResponse;
import com.management.service.OccupancyPeriodService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Occupancy history", description = "Rental history periods per room (when room was vacated)")
public class OccupancyPeriodController {

    private final OccupancyPeriodService occupancyPeriodService;

    @GetMapping("/api/properties/{propertyId}/rooms/{roomId}/occupancy-periods")
    @Operation(summary = "List occupancy periods (rental history) for a room")
    public ResponseEntity<List<OccupancyPeriodResponse>> listPeriods(
            @PathVariable Long propertyId,
            @PathVariable Long roomId) {
        return ResponseEntity.ok(occupancyPeriodService.listByRoom(propertyId, roomId));
    }

    @GetMapping("/api/properties/{propertyId}/rooms/{roomId}/occupancy-periods/{periodId}")
    @Operation(summary = "Get one occupancy period")
    public ResponseEntity<OccupancyPeriodResponse> getPeriod(
            @PathVariable Long propertyId,
            @PathVariable Long roomId,
            @PathVariable Long periodId) {
        return ResponseEntity.ok(occupancyPeriodService.getPeriod(propertyId, roomId, periodId));
    }

    @GetMapping("/api/properties/{propertyId}/rooms/{roomId}/occupancy-periods/{periodId}/occupants")
    @Operation(summary = "List snapshot occupants for an occupancy period")
    public ResponseEntity<List<OccupancyPeriodOccupantResponse>> listPeriodOccupants(
            @PathVariable Long propertyId,
            @PathVariable Long roomId,
            @PathVariable Long periodId) {
        return ResponseEntity.ok(occupancyPeriodService.listOccupantsByPeriod(propertyId, roomId, periodId));
    }
}
