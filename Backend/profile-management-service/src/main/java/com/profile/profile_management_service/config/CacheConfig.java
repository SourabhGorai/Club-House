package com.profile.profile_management_service.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

/**
 * Cache configuration for Profile Management Service
 * Uses Spring's default in-memory cache (ConcurrentMapCache)
 * No external dependencies required - just spring-boot-starter-cache
 */
@Configuration
@EnableCaching
public class CacheConfig {
    // Spring Boot auto-configures ConcurrentMapCacheManager
    // Cache names are defined in service methods using @Cacheable annotations
}