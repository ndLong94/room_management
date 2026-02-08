package com.management.controller;

import com.management.domain.entity.MeterReading;
import com.management.dto.request.MeterReadingRequest;
import com.management.service.MeterReadingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/properties/{propertyId}/rooms/{roomId}/meter-readings")
@RequiredArgsConstructor
@Tag(name = "Meter readings", description = "Record meter readings for rooms")
public class MeterReadingController {

    private final MeterReadingService meterReadingService;

    @GetMapping(params = { "month", "year" })
    @Operation(summary = "Get meter reading for room by month/year. 404 if not found.")
    public ResponseEntity<MeterReading> get(
            @PathVariable Long propertyId,
            @PathVariable Long roomId,
            @RequestParam("month") int month,
            @RequestParam("year") int year) {
        MeterReading reading = meterReadingService.getByRoomAndMonthYear(propertyId, roomId, month, year);
        if (reading == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(reading);
    }

    @PostMapping
    @Operation(summary = "Create or update meter reading for room/month/year")
    public ResponseEntity<MeterReading> create(
            @PathVariable Long propertyId,
            @PathVariable Long roomId,
            @Valid @RequestBody MeterReadingRequest request) {
        MeterReading reading = meterReadingService.create(propertyId, roomId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(reading);
    }
}
