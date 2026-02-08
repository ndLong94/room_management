package com.management.controller;

import com.management.dto.request.UpdatePricingSettingRequest;
import com.management.dto.response.PricingSettingResponse;
import com.management.service.PricingSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@Tag(name = "Settings", description = "Pricing and other settings")
public class PricingSettingController {

    private final PricingSettingService pricingSettingService;

    @GetMapping("/pricing")
    @Operation(summary = "Get current user's pricing settings")
    public ResponseEntity<PricingSettingResponse> getPricing() {
        return ResponseEntity.ok(pricingSettingService.getForCurrentUser());
    }

    @PutMapping("/pricing")
    @Operation(summary = "Update pricing settings")
    public ResponseEntity<PricingSettingResponse> updatePricing(@Valid @RequestBody UpdatePricingSettingRequest request) {
        return ResponseEntity.ok(pricingSettingService.updateForCurrentUser(request));
    }
}
