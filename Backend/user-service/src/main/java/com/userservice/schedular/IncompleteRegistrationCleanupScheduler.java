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
    private final CacheManager cacheManager;

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
     * Permanently deletes users who:
     *   - Registered more than 7 days ago
     *   - Never completed their profile (profileCompleted = false)
     *
     * NOT @Transactional at the top level — each batch manages its own
     * transaction via deleteBatch(), so a failure in one batch doesn't
     * roll back the successfully deleted batches before it.
     */
    @Scheduled(cron = "0 0 0 * * *")   // midnight every day
    public void cleanupIncompleteRegistrations() {
        LocalDateTime cutoff = LocalDateTime.now().minusWeeks(1);

        log.info("Starting incomplete registration cleanup — cutoff: {}", cutoff);

        List<User> incomplete = userRepository.findIncompleteRegistrations(cutoff);

        if (incomplete.isEmpty()) {
            log.info("Incomplete registration cleanup complete — nothing to delete");
            return;
        }

        log.info("Found {} incomplete registrations older than 7 days", incomplete.size());

        int batchSize    = 100;
        int totalDeleted = 0;

        for (int i = 0; i < incomplete.size(); i += batchSize) {
            List<User> batch = incomplete.subList(i, Math.min(i + batchSize, incomplete.size()));
            try {
                int deleted = deleteBatch(batch);
                totalDeleted += deleted;
                log.debug("Deleted batch of {} users", deleted);
            } catch (Exception e) {
                log.error("Failed to delete batch starting at index {}: {}", i, e.getMessage(), e);
            }
        }

        log.info("Incomplete registration cleanup complete — deleted {} of {} users",
                totalDeleted, incomplete.size());
    }

    /**
     * Wraps a single batch delete in its own transaction.
     * If this batch fails it rolls back only itself — other batches are unaffected.
     */
    @Transactional
    public int deleteBatch(List<User> batch) {
        List<String> prns = batch.stream().map(User::getPrn).toList();
        int deleted = userRepository.deleteByPrns(prns);
        evictCachesForUsers(batch);
        return deleted;
    }
}