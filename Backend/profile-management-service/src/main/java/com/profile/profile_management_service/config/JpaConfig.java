package com.profile.profile_management_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JPA Configuration
 * Enables JPA auditing for automatic timestamp management
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
    // JPA auditing configuration
}