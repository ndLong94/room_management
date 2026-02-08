package com.management.controller;

import com.management.dto.request.CreatePropertyRequest;
import com.management.dto.request.UpdatePropertyRequest;
import com.management.dto.response.PropertyResponse;
import com.management.service.PropertyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@Tag(name = "Properties", description = "CRUD for properties (scoped to current user)")
public class PropertyController {

    private final PropertyService propertyService;

    @GetMapping
    @Operation(summary = "List all properties for current user")
    public ResponseEntity<List<PropertyResponse>> list() {
        return ResponseEntity.ok(propertyService.findAllForCurrentUser());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get property by id")
    public ResponseEntity<PropertyResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(propertyService.findByIdForCurrentUser(id));
    }

    @PostMapping
    @Operation(summary = "Create a property")
    public ResponseEntity<PropertyResponse> create(@Valid @RequestBody CreatePropertyRequest request) {
        PropertyResponse created = propertyService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a property")
    public ResponseEntity<PropertyResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody UpdatePropertyRequest request) {
        return ResponseEntity.ok(propertyService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a property")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        propertyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
