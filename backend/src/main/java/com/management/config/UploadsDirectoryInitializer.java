package com.management.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.PosixFilePermission;
import java.nio.file.attribute.PosixFilePermissions;
import java.util.Set;

@Configuration
@Slf4j
public class UploadsDirectoryInitializer {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Bean
    public ApplicationRunner ensureUploadsDirectory() {
        return args -> {
            Path path = Paths.get(uploadDir).toAbsolutePath().normalize();
            try {
                // Create directory if it doesn't exist
                if (!Files.exists(path)) {
                    Files.createDirectories(path);
                    log.info("Created uploads directory: {}", path);
                } else {
                    log.info("Uploads directory exists: {}", path);
                }

                // Try to set permissions (works on Unix-like systems)
                try {
                    Set<PosixFilePermission> perms = PosixFilePermissions.fromString("rwxr-xr-x");
                    Files.setPosixFilePermissions(path, perms);
                    log.info("Set permissions on uploads directory: {}", path);
                } catch (UnsupportedOperationException e) {
                    // Windows doesn't support PosixFilePermissions, that's OK
                    log.debug("PosixFilePermissions not supported (likely Windows), skipping");
                } catch (Exception e) {
                    log.warn("Could not set permissions on uploads directory: {}", e.getMessage());
                }

                // Verify directory is readable and writable
                boolean readable = Files.isReadable(path);
                boolean writable = Files.isWritable(path);
                boolean exists = Files.exists(path);
                
                log.info("Uploads directory status - path: {}, exists: {}, readable: {}, writable: {}", 
                        path, exists, readable, writable);

                if (!exists) {
                    log.error("Uploads directory does not exist: {}", path);
                } else if (!readable) {
                    log.error("Uploads directory is not readable: {}", path);
                } else if (!writable) {
                    log.warn("Uploads directory is not writable: {} (files can still be read)", path);
                }
            } catch (Exception e) {
                log.error("Failed to initialize uploads directory: {}", path, e);
            }
        };
    }
}
