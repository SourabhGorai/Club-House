package com.clubHouse.event_service2.schedular;

import com.clubHouse.event_service2.client.ProfileManagementServiceClient;
import com.clubHouse.event_service2.repository.EventRepository;
import com.clubHouse.event_service2.repository.EventEnrollmentRepository;
import com.clubHouse.event_service2.repository.RatingsRepository;
import com.clubHouse.event_service2.repository.TargetDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    /**
     * Runs annually on January 15th at 3:00 AM
     * Deletes all event-related data for deactivated/expired user profiles
     */
    @Scheduled(cron = "0 0 3 15 1 *")
    @Transactional
    public void cleanupEventsOfExpiredProfiles() {
        log.info("Starting scheduled job: Cleanup events for expired/deactivated profiles");

        try {
            // Fetch ONLY newly expired profiles (not yet cleaned up)
            List<String> expiredPrns = profileManagementServiceClient.getExpiredProfiles();

            if (expiredPrns == null || expiredPrns.isEmpty()) {
                log.info("No newly expired profiles found. Skipping cleanup.");
                return;
            }

            log.info("Found {} newly expired profiles. Starting cleanup...", expiredPrns.size());

            int totalEventsDeleted = 0;
            int totalEnrollmentsDeleted = 0;

            for (String prn : expiredPrns) {
                // Get all event IDs created by this user
                List<Long> eventIds = eventRepository.findEventIdsByEventCreator(prn);

                if (!eventIds.isEmpty()) {
                    // Delete all related data for these events (child tables first)
                    int enrollmentsDeleted = eventEnrollmentRepository.deleteByEvent_EventIdIn(eventIds);
                    int targetDataDeleted = targetDataRepository.deleteByEvents_EventIdIn(eventIds);
                    int ratingsDeleted = ratingsRepository.deleteByEventIdIn(eventIds);
                    int eventsDeleted = eventRepository.deleteByEventIdIn(eventIds);

                    totalEventsDeleted += eventsDeleted;
                    totalEnrollmentsDeleted += enrollmentsDeleted;

                    log.info("Deleted data for PRN {}: {} events, {} enrollments, {} target data, {} ratings",
                            prn, eventsDeleted, enrollmentsDeleted, targetDataDeleted, ratingsDeleted);
                }

                // Also delete enrollments where this user was enrolled (not creator)
                int userEnrollmentsDeleted = eventEnrollmentRepository.deleteByPrn(prn);
                totalEnrollmentsDeleted += userEnrollmentsDeleted;

                if (userEnrollmentsDeleted > 0) {
                    log.info("Deleted {} enrollments for user {}", userEnrollmentsDeleted, prn);
                }
            }

            // IMPORTANT: Mark these profiles as cleaned up in Profile Service
            profileManagementServiceClient.markProfilesAsCleanedUp(expiredPrns);

            log.info("Successfully completed cleanup for expired profiles. " +
                            "Total events deleted: {}, Total enrollments deleted: {}",
                    totalEventsDeleted, totalEnrollmentsDeleted);

        } catch (Exception e) {
            log.error("Error occurred while cleaning up events for expired profiles", e);
            throw e;
        }
    }

    /**
     * Runs annually on February 1st at 2:00 AM
     * Deletes events (and related data) older than 3 years
     */
    @Scheduled(cron = "0 0 2 1 2 *") // 2:00 AM on Feb 1st every year
    @Transactional
    public void cleanupOldEvents() {
        log.info("Starting scheduled job: Cleanup events older than 3 years");

        try {
            LocalDateTime threeYearsAgo = LocalDateTime.now().minusYears(3);

            // Find all event IDs older than 3 years
            List<Long> oldEventIds = eventRepository.findEventIdsCreatedBefore(threeYearsAgo);

            if (oldEventIds.isEmpty()) {
                log.info("No events older than 3 years found. Skipping cleanup.");
                return;
            }

            log.info("Found {} events older than 3 years. Starting deletion...", oldEventIds.size());

            // Delete all related data in correct order (child tables first)
            int enrollmentsDeleted = eventEnrollmentRepository.deleteByEvent_EventIdIn(oldEventIds);
            int targetDataDeleted = targetDataRepository.deleteByEvents_EventIdIn(oldEventIds);
            int ratingsDeleted = ratingsRepository.deleteByEventIdIn(oldEventIds);
            int eventsDeleted = eventRepository.deleteByEventIdIn(oldEventIds);

            log.info("Successfully deleted old events. Events: {}, Enrollments: {}, " +
                            "Target Data: {}, Ratings: {}",
                    eventsDeleted, enrollmentsDeleted, targetDataDeleted, ratingsDeleted);

        } catch (Exception e) {
            log.error("Error occurred while cleaning up old events", e);
            throw e;
        }
    }

    /**
     * Optional: Manual trigger for testing or administrative purposes
     */
    public void manualCleanupExpiredProfiles() {
        log.info("Manual trigger: Cleanup events for expired profiles");
        cleanupEventsOfExpiredProfiles();
    }

    /**
     * Optional: Manual trigger for testing or administrative purposes
     */
    public void manualCleanupOldEvents() {
        log.info("Manual trigger: Cleanup events older than 3 years");
        cleanupOldEvents();
    }
}