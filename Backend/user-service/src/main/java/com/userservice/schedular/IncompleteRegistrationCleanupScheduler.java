package com.userservice.schedular;

import com.userservice.model.User;
import com.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class IncompleteRegistrationCleanupScheduler {

    private final UserRepository userRepository;
    private final CacheManager cacheManager; // add to constructor (Lombok handles it)

    // Add this helper method
    private void evictCachesForUsers(List<User> users) {
        Cache userByPrn      = cacheManager.getCache("userByPrn");
        Cache userByUsername = cacheManager.getCache("userByUsername");
        Cache userValidation = cacheManager.getCache("userValidation");
        Cache usersCache     = cacheManager.getCache("users");

        for (User user : users) {
            if (userByPrn != null)      userByPrn.evict(user.getPrn());
            if (userByUsername != null) userByUsername.evict(user.getUsername());
            if (userValidation != null) userValidation.evict(user.getPrn());
        }
        if (usersCache != null) usersCache.clear();
    }

    /**
     * Runs every 7 days at 3:00 AM.
     *
     * Permanently deletes users who:
     *   - Registered more than 7 days ago
     *   - Never completed their profile (profileCompleted = false)
     *
     * These are considered abandoned registrations — the user signed up
     * but never followed through with profile creation.
     *
     * Processed in batches of 100 to avoid locking the table.
     */
    @Scheduled(cron = "0 0 3 * * MON")   // 3:00 AM every Monday
    @Transactional
    public void cleanupIncompleteRegistrations() {
        LocalDateTime cutoff = LocalDateTime.now().minusWeeks(1);

        log.info("Starting incomplete registration cleanup — cutoff: {}", cutoff);

        List<User> incomplete = userRepository.findIncompleteRegistrations(cutoff);

        if (incomplete.isEmpty()) {
            log.info("Incomplete registration cleanup complete — nothing to delete");
            return;
        }

        log.info("Found {} incomplete registrations older than 7 days", incomplete.size());

        int batchSize = 100;
        int totalDeleted = 0;

        for (int i = 0; i < incomplete.size(); i += batchSize) {
            List<User> batch = incomplete.subList(i, Math.min(i + batchSize, incomplete.size()));
            List<String> batchPrns = batch.stream()
                    .map(User::getPrn)
                    .toList();

            try {
                int deleted = userRepository.deleteByPrns(batchPrns);
                totalDeleted += deleted;
                evictCachesForUsers(batch);
                log.debug("Deleted batch of {} users (prns: {})", deleted, batchPrns);

            } catch (Exception e) {
                // Log and continue — don't let one bad batch abort the entire run
                log.error("Failed to delete batch starting at index {}: {}", i, e.getMessage(), e);
            }
        }

        log.info("Incomplete registration cleanup complete — deleted {} of {} users",
                totalDeleted, incomplete.size());
    }
}