package com.management.service;

import com.management.dto.response.FileUploadResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@Slf4j
public class FileUploadService {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    /** Aligned with {@code spring.servlet.multipart.max-file-size}. */
    @Value("${spring.servlet.multipart.max-file-size}")
    private DataSize maxMultipartSize;
    private static final String[] ALLOWED_EXTENSIONS = {
        ".jpg", ".jpeg", ".png", ".gif", ".webp",
        ".pdf", ".doc", ".docx"
    };

    public FileUploadResponse upload(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        if (file.getSize() > maxMultipartSize.toBytes()) {
            throw new IllegalArgumentException("File size must be at most " + maxMultipartSize);
        }
        String originalFilename = file.getOriginalFilename();
        String ext = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            ext = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase();
        }
        boolean allowed = false;
        for (String e : ALLOWED_EXTENSIONS) {
            if (e.equals(ext)) {
                allowed = true;
                break;
            }
        }
        if (!allowed) {
            throw new IllegalArgumentException("Allowed types: jpg, jpeg, png, gif, webp, pdf, doc, docx");
        }

        Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(dir);
        String filename = UUID.randomUUID().toString().replace("-", "") + ext;
        Path target = dir.resolve(filename);
        Files.copy(file.getInputStream(), target);

        String url = "/uploads/" + filename;
        log.debug("Uploaded file: {}", url);
        return FileUploadResponse.builder().url(url).build();
    }
}
