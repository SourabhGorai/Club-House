package com.clubHouse.tnp.schedular;

import com.clubHouse.tnp.config.CacheConfig;
import com.clubHouse.tnp.service.CompanyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class StudentSyncScheduler {

    private final CompanyService companyService;
    private final CacheManager cacheManager;

    @Scheduled(cron = "0 0 0 1 8 *")
    public void syncHiredStudentsYearly() {

        String session = getSession();

        log.info("Scheduler triggered: syncing hired students for session {}", session);

        companyService.countTotalHiredStudents(session);

        evictCache(CacheConfig.ALL_COMPANIES);
        evictCache(CacheConfig.COMPANY_BY_ID);
        evictCache(CacheConfig.COMPANIES_BY_NAME);
        evictCache(CacheConfig.COMPANIES_BY_INDUSTRY);
        evictCache(CacheConfig.COMPANIES_BY_SESSION);
        evictCache(CacheConfig.COMPANIES_BY_PACKAGE_RANGE);
        evictCache(CacheConfig.COMPANIES_BY_MIN_HIRED);
        evictCache(CacheConfig.COMBINED_PACKAGES_BY_SESSION);
        evictCache(CacheConfig.COMPANY_OVERALL_STATS);
        evictCache(CacheConfig.PLACEMENT_STATS_BY_SESSION);
        evictCache(CacheConfig.PLACEMENTS_BY_SESSION);

        log.info("Cache fully evicted after scheduled student sync for session {}", session);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void evictCache(String cacheName) {
        var cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.clear();
            log.debug("Evicted cache: {}", cacheName);
        }
    }

    private String getSession() {
        LocalDate now = LocalDate.now();
        int year = now.getYear();

        int startYear = (now.getMonthValue() >= 8) ? year : year - 1;
        int endYear = startYear + 1;

        return startYear + "-" + String.valueOf(endYear).substring(2);
    }
}