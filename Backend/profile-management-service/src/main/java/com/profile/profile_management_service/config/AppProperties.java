package com.profile.profile_management_service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Application Properties Configuration
 * Maps application-specific properties
 */
@Configuration
@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {

    private ImageConfig image = new ImageConfig();
    private SecurityConfig security = new SecurityConfig();

    @Data
    public static class ImageConfig {
        private long maxSize = 512000; // 500KB
        private String[] allowedTypes = {"image/jpeg", "image/jpg", "image/png", "image/gif"};
    }

    @Data
    public static class SecurityConfig {
        private boolean enableCors = true;
        private String[] allowedOrigins = {"http://localhost:3000", "http://localhost:8080"};
    }
}