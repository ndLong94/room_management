package com.management.controller;

import com.management.dto.response.FileUploadResponse;
import com.management.service.FileUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "Files", description = "Upload images (e.g. occupant avatar, ID)")
public class FileController {

    private final FileUploadService fileUploadService;

    @PostMapping("/upload")
    @Operation(summary = "Upload a file (multipart/form-data, field name: file). Returns { url }.")
    public ResponseEntity<FileUploadResponse> upload(@RequestParam("file") MultipartFile file) throws IOException {
        FileUploadResponse response = fileUploadService.upload(file);
        return ResponseEntity.ok(response);
    }
}
