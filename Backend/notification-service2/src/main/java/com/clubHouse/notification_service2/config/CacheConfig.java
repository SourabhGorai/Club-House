package com.clubHouse.notification_service2.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Slf4j
@Configuration
@EnableCaching
@EnableScheduling
public class CacheConfig {

    // ── Cache name constants (use these everywhere — no magic strings) ─────────

    /** Single department by ID */
    public static final String DEPARTMENT_CACHE       = "department";

    /** All departments list */
    public static final String DEPARTMENTS_LIST_CACHE = "departmentsList";

    /** Single club by ID */
    public static final String CLUB_CACHE             = "club";

    /** Single event by ID */
    public static final String EVENT_CACHE            = "event";

    /**
     * User's dept ID + year from profile service — keyed by PRN.
     * This is called on every /me request, and dept/year rarely changes.
     */
    public static final String PROFILE_DATA_CACHE     = "profileData";

    // ──────────────────────────────────────────────────────────────────────────

    private CacheManager cacheManager;

    @Bean
    public CacheManager cacheManager() {
        this.cacheManager = new ConcurrentMapCacheManager(
                DEPARTMENT_CACHE,
                DEPARTMENTS_LIST_CACHE,
                CLUB_CACHE,
                EVENT_CACHE,
                PROFILE_DATA_CACHE
        );
        return this.cacheManager;
    }

    // ── Scheduled eviction (simulates TTL) ────────────────────────────────────

    /*
     * ConcurrentMapCacheManager has no built-in TTL or max-size.
     * We simulate TTL by clearing each cache on a fixed schedule.
     *
     * Intervals are tuned to how often the underlying data changes:
     *
     *   department / departmentsList  →  every 60 min  (rarely changes)
     *   club                          →  every 30 min  (changes occasionally)
     *   event                         →  every 10 min  (title/details can change)
     */

    @Scheduled(fixedRateString = "PT60M")
    public void evictDepartmentCaches() {
        evict(DEPARTMENT_CACHE);
        evict(DEPARTMENTS_LIST_CACHE);
    }

    @Scheduled(fixedRateString = "PT30M")
    public void evictClubCache() {
        evict(CLUB_CACHE);
    }

    /** Clears profile data cache every 30 minutes */
    @Scheduled(fixedRateString = "PT30M")
    public void evictProfileDataCache() {
        evict(PROFILE_DATA_CACHE);
    }

    @Scheduled(fixedRateString = "PT10M")
    public void evictEventCache() {
        evict(EVENT_CACHE);
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private void evict(String cacheName) {
        if (cacheManager != null) {
            var cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
                log.debug("Scheduled eviction: cleared cache '{}'", cacheName);
            }
        }
    }
}