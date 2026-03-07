package com.profile.profile_management_service.schedular;

import com.profile.profile_management_service.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled job to automatically deactivate student profiles
 * after 4 years from creation (BTech tenure completion)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ProfileDeactivationScheduler {

    private final ProfileRepository userProfileRepository;
    private final CacheManager cacheManager;

    private void evictAllProfileCaches() {
        List.of(
                "profileByPrn", "publicProfile", "profileSummary",
                "profileExists", "profilesByDept", "profilesByYear",
                "allProfiles", "imageMetadata", "profileImage"
        ).forEach(cacheName -> {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) cache.invalidate();
        });
        log.debug("Evicted all profile caches");
    }

    @Scheduled(cron = "0 5 0 1 6 *") // June 1st 12:05 AM
    @Transactional
    public void promoteStudentsYear() {

        log.info("Starting yearly promotion job...");

        int updatedCount = userProfileRepository.promoteStudents();
        evictAllProfileCaches();
        log.info("Promoted {} students to next year", updatedCount);
    }

    /**
     * Runs annually on January 1st at 2:00 AM
     * Deactivates profiles that are 4 years or older
     */
    @Scheduled(cron = "0 0 2 1 1 *") // Runs at 2:00 AM on Jan 1st every year
    @Transactional
    public void deactivateExpiredProfiles() {
        log.info("Starting scheduled job: Deactivating profiles older than 4 years");
        
        try {
            LocalDateTime fourYearsAgo = LocalDateTime.now().minusYears(4);
            
            int deactivatedCount = userProfileRepository.deactivateProfilesOlderThan(fourYearsAgo);
            evictAllProfileCaches();
            log.info("Successfully deactivated {} student profiles created before {}", 
                    deactivatedCount, fourYearsAgo);
                    
        } catch (Exception e) {
            log.error("Error occurred while deactivating expired profiles", e);
            throw e;
        }
    }
    
    /**
     * Optional: Manual trigger for testing or administrative purposes
     */
    public int manuallyDeactivateExpiredProfiles() {
        log.info("Manual trigger: Deactivating profiles older than 4 years");
        LocalDateTime fourYearsAgo = LocalDateTime.now().minusYears(4);
        return userProfileRepository.deactivateProfilesOlderThan(fourYearsAgo);
    }
}