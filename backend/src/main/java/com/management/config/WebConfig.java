package com.management.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@Slf4j
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path path = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            // Ensure directory exists with proper permissions
            Files.createDirectories(path);
            // Try to set readable permissions (if possible)
            try {
                path.toFile().setReadable(true, false);
            } catch (Exception ignored) {
                // Ignore if we can't set permissions
            }
            log.info("Serving uploads from: {} (exists: {}, readable: {})", 
                    path, Files.exists(path), Files.isReadable(path));
        } catch (Exception e) {
            log.error("Failed to create upload directory: {}", path, e);
        }
        
        // Convert to file: URI format that Spring expects
        // For absolute paths like /app/uploads, toUri() returns file:///app/uploads
        // Spring ResourceHandlerRegistry needs file:///app/uploads/ (with trailing slash)
        String location = path.toUri().toString();
        // Ensure trailing slash for directory
        if (!location.endsWith("/")) {
            location = location + "/";
        }
        
        log.info("Registering resource handler /uploads/** -> {}", location);
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location)
                .setCachePeriod(3600); // Cache for 1 hour
    }
}
