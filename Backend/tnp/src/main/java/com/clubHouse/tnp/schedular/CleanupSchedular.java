package com.clubHouse.tnp.schedular;

import com.clubHouse.tnp.config.CacheConfig;
import com.clubHouse.tnp.model.Tnp;
import com.clubHouse.tnp.repository.TnpRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CleanupSchedular {

    private final TnpRepository tnpRepository;
    private final CacheManager cacheManager;

    // ── Runs every day at midnight ────────────────────────────────────────────

    /**
     * Marks isActive = false for all members whose endDate has passed.
     * Runs daily at midnight.
     */
    @Transactional
    @Scheduled(cron = "0 0 0 * * *")
    public void deactivateExpiredMembers() {

        log.info("Scheduler triggered: checking for expired TNP memberships");

        List<Tnp> expiredMembers = tnpRepository
                .findAllByIsActiveTrueAndEndDateBefore(LocalDateTime.now());

        if (expiredMembers.isEmpty()) {
            log.info("No expired TNP memberships found");
            return;
        }

        expiredMembers.forEach(Tnp::Deactivate);
        tnpRepository.saveAll(expiredMembers);

        log.info("Deactivated {} expired TNP memberships", expiredMembers.size());

        // Members flipped from active → inactive: evict all TNP member caches.
        // PLACEMENT_STATS and COMPANY caches are unaffected — deactivation is
        // a membership-only change, not a data change.
        evictCache(CacheConfig.TNP_ALL_ACTIVE_MEMBERS);
        evictCache(CacheConfig.TNP_ALL_INACTIVE_MEMBERS);
        evictCache(CacheConfig.TNP_MEMBERS_BY_ROLE);
        evictCache(CacheConfig.TNP_MEMBERS_BY_YEAR);
        // Per-PRN entries for each deactivated member
        expiredMembers.forEach(member ->
                evictCacheKey(CacheConfig.TNP_MEMBER_BY_PRN, member.getPrn())
        );

        log.info("Cache evicted after deactivating {} expired TNP memberships",
                expiredMembers.size());
    }

    /**
     * Permanently deletes members who have been inactive for more than 1 year.
     * Runs every day at 1:00 AM to avoid overlap with deactivation job above.
     */
    @Transactional
    @Scheduled(cron = "0 0 1 * * *")
    public void deleteStaleInactiveMembers() {

        log.info("Scheduler triggered: checking for stale inactive TNP members");

        LocalDateTime oneYearAgo = LocalDateTime.now().minusYears(1);

        List<Tnp> staleMembers = tnpRepository
                .findAllByIsActiveFalseAndEndDateBefore(oneYearAgo);

        if (staleMembers.isEmpty()) {
            log.info("No stale inactive TNP members found");
            return;
        }

        tnpRepository.deleteAll(staleMembers);

        log.info("Permanently deleted {} stale inactive TNP members", staleMembers.size());

        // Hard-deleted members: evict all TNP caches including per-PRN entries.
        evictCache(CacheConfig.TNP_ALL_ACTIVE_MEMBERS);
        evictCache(CacheConfig.TNP_ALL_INACTIVE_MEMBERS);
        evictCache(CacheConfig.TNP_MEMBERS_BY_ROLE);
        evictCache(CacheConfig.TNP_MEMBERS_BY_YEAR);
        staleMembers.forEach(member ->
                evictCacheKey(CacheConfig.TNP_MEMBER_BY_PRN, member.getPrn())
        );

        log.info("Cache evicted after deleting {} stale inactive TNP members",
                staleMembers.size());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void evictCache(String cacheName) {
        var cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.clear();
            log.debug("Evicted cache: {}", cacheName);
        }
    }

    private void evictCacheKey(String cacheName, Object key) {
        var cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.evict(key);
            log.debug("Evicted key '{}' from cache: {}", key, cacheName);
        }
    }
}