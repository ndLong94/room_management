package com.management.controller;

import com.management.dto.response.DashboardSummaryResponse;
import com.management.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Validated
@Tag(name = "Dashboard", description = "Summary statistics")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Get dashboard summary for a month/year")
    public ResponseEntity<DashboardSummaryResponse> getSummary(
            @RequestParam @Min(1) @Max(12) int month,
            @RequestParam @Min(2000) @Max(2100) int year) {
        return ResponseEntity.ok(dashboardService.getSummary(month, year));
    }
}
