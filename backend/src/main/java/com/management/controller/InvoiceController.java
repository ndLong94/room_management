package com.management.controller;

import com.management.domain.enums.InvoiceStatus;
import com.management.dto.request.MarkPaidRequest;
import com.management.dto.response.InvoiceResponse;
import com.management.service.InvoiceService;
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
@Tag(name = "Invoices", description = "Generate and manage invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping("/api/properties/{propertyId}/rooms/{roomId}/invoices/generate")
    @Operation(summary = "Generate (or upsert) invoice for a room/month/year")
    public ResponseEntity<InvoiceResponse> generate(
            @PathVariable Long propertyId,
            @PathVariable Long roomId,
            @RequestParam int month,
            @RequestParam int year) {
        InvoiceResponse created = invoiceService.generate(roomId, month, year);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/api/invoices")
    @Operation(summary = "List invoices with optional filters (month, year, propertyId, status). Sorted by date desc.")
    public ResponseEntity<List<InvoiceResponse>> list(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Long propertyId,
            @RequestParam(required = false) InvoiceStatus status) {
        return ResponseEntity.ok(invoiceService.list(month, year, propertyId, status));
    }

    @GetMapping("/api/invoices/{id}")
    @Operation(summary = "Get invoice by id")
    public ResponseEntity<InvoiceResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getById(id));
    }

    @PostMapping("/api/invoices/{id}/mark-paid")
    @Operation(summary = "Mark invoice as paid")
    public ResponseEntity<InvoiceResponse> markPaid(@PathVariable Long id,
                                                    @Valid @RequestBody MarkPaidRequest request) {
        return ResponseEntity.ok(invoiceService.markPaid(id, request));
    }

    @PostMapping("/api/invoices/{id}/mark-unpaid")
    @Operation(summary = "Mark invoice as unpaid")
    public ResponseEntity<InvoiceResponse> markUnpaid(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.markUnpaid(id));
    }
}
