package com.clubHouse.event_service2.scheduler;

import com.clubHouse.event_service2.client.ProfileManagementServiceClient;
import com.clubHouse.event_service2.config.CacheConfig;
import com.clubHouse.event_service2.repository.EventRepository;
import com.clubHouse.event_service2.repository.EventEnrollmentRepository;
import com.clubHouse.event_service2.repository.RatingsRepository;
import com.clubHouse.event_service2.repository.TargetDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled jobs for event cleanup:
 * 1. Delete event records of deactivated/expired user profiles
 * 2. Delete events older than 3 years
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EventCleanupScheduler {

    private final EventRepository eventRepository;
    private final EventEnrollmentRepository eventEnrollmentRepository;
    private final RatingsRepository ratingsRepository;
    private final TargetDataRepository targetDataRepository;
    private final ProfileManagementServiceClient profileManagementServiceClient;

    // ── Cleanup events of expired profiles ────────────────────────────────────
    // Deletes: events, enrollments, ratings, target data
    // Stale caches: everything — wipe all caches since arbitrary rows are gone.
    @Scheduled(cron = "0 0 3 15 1 *")
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.EVENT_BY_ID,                 allEntries = true),
            @CacheEvict(value = CacheConfig.ALL_EVENTS,                  allEntries = true),
            @CacheEvict(value = CacheConfig.MY_EVENTS,                   allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_STATUS,            allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_TYPE,       allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_CREATOR,           allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ORGANIZER,         allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_RATING,            allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_DATA,       allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ENROLLMENT_STATUS, allEntries = true),
            @CacheEvict(value = CacheConfig.MY_ENROLLMENTS,              allEntries = true),
            @CacheEvict(value = CacheConfig.MY_ENROLLED_EVENTS,          allEntries = true),
            @CacheEvict(value = CacheConfig.ENROLLMENTS_FOR_EVENT,       allEntries = true),
            @CacheEvict(value = CacheConfig.TARGET_TYPES,                allEntries = true),
            @CacheEvict(value = CacheConfig.EVENT_COUNT_BY_CLUB,         allEntries = true)
    })
    public void cleanupEventsOfExpiredProfiles() {
        log.info("Starting scheduled job: Cleanup events for expired/deactivated profiles");

        try {
            List<String> expiredPrns = profileManagementServiceClient.getExpiredProfiles();

            if (expiredPrns == null || expiredPrns.isEmpty()) {
                log.info("No newly expired profiles found. Skipping cleanup.");
                return;
            }

            log.info("Found {} newly expired profiles. Starting cleanup...", expiredPrns.size());

            int totalEventsDeleted = 0;
            int totalEnrollmentsDeleted = 0;

            for (String prn : expiredPrns) {
                List<Long> eventIds = eventRepository.findEventIdsByEventCreator(prn);

                if (!eventIds.isEmpty()) {
                    int enrollmentsDeleted  = eventEnrollmentRepository.deleteByEvent_EventIdIn(eventIds);
                    int targetDataDeleted   = targetDataRepository.deleteByEvents_EventIdIn(eventIds);
                    int ratingsDeleted      = ratingsRepository.deleteByEvent_EventIdIn(eventIds);
                    int eventsDeleted       = eventRepository.deleteByEventIdIn(eventIds);

                    totalEventsDeleted      += eventsDeleted;
                    totalEnrollmentsDeleted += enrollmentsDeleted;

                    log.info("Deleted data for PRN {}: {} events, {} enrollments, {} target data, {} ratings",
                            prn, eventsDeleted, enrollmentsDeleted, targetDataDeleted, ratingsDeleted);
                }

                int userEnrollmentsDeleted = eventEnrollmentRepository.deleteByPrn(prn);
                totalEnrollmentsDeleted += userEnrollmentsDeleted;

                if (userEnrollmentsDeleted > 0) {
                    log.info("Deleted {} enrollments for user {}", userEnrollmentsDeleted, prn);
                }
            }

            profileManagementServiceClient.markProfilesAsCleanedUp(expiredPrns);

            log.info("Completed cleanup for expired profiles. Events deleted: {}, Enrollments deleted: {}",
                    totalEventsDeleted, totalEnrollmentsDeleted);

        } catch (Exception e) {
            log.error("Error occurred while cleaning up events for expired profiles", e);
            throw e;
        }
    }

    // ── Cleanup old events (> 3 years) ────────────────────────────────────────
    // Deletes: events, enrollments, ratings, target data
    // Stale caches: everything — same reasoning as above.
    @Scheduled(cron = "0 0 2 1 2 *")
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.EVENT_BY_ID,                 allEntries = true),
            @CacheEvict(value = CacheConfig.ALL_EVENTS,                  allEntries = true),
            @CacheEvict(value = CacheConfig.MY_EVENTS,                   allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_STATUS,            allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_TYPE,       allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_CREATOR,           allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ORGANIZER,         allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_RATING,            allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_DATA,       allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ENROLLMENT_STATUS, allEntries = true),
            @CacheEvict(value = CacheConfig.MY_ENROLLMENTS,              allEntries = true),
            @CacheEvict(value = CacheConfig.MY_ENROLLED_EVENTS,          allEntries = true),
            @CacheEvict(value = CacheConfig.ENROLLMENTS_FOR_EVENT,       allEntries = true),
            @CacheEvict(value = CacheConfig.TARGET_TYPES,                allEntries = true),
            @CacheEvict(value = CacheConfig.EVENT_COUNT_BY_CLUB,         allEntries = true)
    })
    public void cleanupOldEvents() {
        log.info("Starting scheduled job: Cleanup events older than 3 years");

        try {
            LocalDateTime threeYearsAgo = LocalDateTime.now().minusYears(3);

            List<Long> oldEventIds = eventRepository.findEventIdsCreatedBefore(threeYearsAgo);

            if (oldEventIds.isEmpty()) {
                log.info("No events older than 3 years found. Skipping cleanup.");
                return;
            }

            log.info("Found {} events older than 3 years. Starting deletion...", oldEventIds.size());

            int enrollmentsDeleted = eventEnrollmentRepository.deleteByEvent_EventIdIn(oldEventIds);
            int targetDataDeleted  = targetDataRepository.deleteByEvents_EventIdIn(oldEventIds);
            int ratingsDeleted     = ratingsRepository.deleteByEvent_EventIdIn(oldEventIds);
            int eventsDeleted      = eventRepository.deleteByEventIdIn(oldEventIds);

            log.info("Deleted old events. Events: {}, Enrollments: {}, Target Data: {}, Ratings: {}",
                    eventsDeleted, enrollmentsDeleted, targetDataDeleted, ratingsDeleted);

        } catch (Exception e) {
            log.error("Error occurred while cleaning up old events", e);
            throw e;
        }
    }

    public void manualCleanupExpiredProfiles() {
        log.info("Manual trigger: Cleanup events for expired profiles");
        cleanupEventsOfExpiredProfiles();
    }

    public void manualCleanupOldEvents() {
        log.info("Manual trigger: Cleanup events older than 3 years");
        cleanupOldEvents();
    }
}