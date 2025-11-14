package com.profile.profile_management_service.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Application Startup Listener
 * Logs application startup information
 */
@Component
@Slf4j
public class ApplicationStartupListener {

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("=".repeat(80));
        log.info("Profile Management Service Started Successfully");
        log.info("=".repeat(80));
        log.info("Service Name: profile-management-service");
        log.info("Port: Check application.properties for configured port");
        log.info("API Base Path: /api/profiles");
        log.info("Health Check: GET /api/profiles/health");
        log.info("=".repeat(80));
    }
}