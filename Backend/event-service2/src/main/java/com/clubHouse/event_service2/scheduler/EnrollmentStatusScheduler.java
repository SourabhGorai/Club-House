package com.clubHouse.event_service2.scheduler;

import com.clubHouse.event_service2.config.CacheConfig;
import com.clubHouse.event_service2.model.Events;
import com.clubHouse.event_service2.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class EnrollmentStatusScheduler {

    private final EventRepository eventRepository;

    // ── Mark events complete ──────────────────────────────────────────────────
    // Changes: event.completed = true
    // Stale caches: EVENT_BY_ID (per event), ALL_EVENTS, EVENTS_BY_STATUS,
    //               MY_EVENTS, EVENTS_BY_CREATOR, EVENTS_BY_TARGET_TYPE,
    //               EVENTS_BY_ORGANIZER, EVENTS_BY_TARGET_DATA
    // We use allEntries=true for list caches because we don't know which
    // specific keys are affected without inspecting every event.
    @Scheduled(cron = "0 0 */1 * * *")
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.EVENT_BY_ID,                 allEntries = true),
            @CacheEvict(value = CacheConfig.ALL_EVENTS,                  allEntries = true),
            @CacheEvict(value = CacheConfig.MY_EVENTS,                   allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_STATUS,            allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_TYPE,       allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_CREATOR,           allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ORGANIZER,         allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_DATA,       allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ENROLLMENT_STATUS, allEntries = true),
    })
    public void markEventsComplete() {
        log.debug("Running scheduled task: Checking for completed events");

        LocalDateTime thresholdTime = LocalDateTime.now().minusHours(3);

        List<Events> completedEvents = eventRepository
                .findByIsCompletedAndEventDateBefore(false, thresholdTime);

        if (completedEvents.isEmpty()) {
            log.info("No events to mark complete");
            return;
        }

        log.info("Found {} events to mark as completed", completedEvents.size());

        for (Events event : completedEvents) {
            event.setCompleted(true);
            log.info("Event completed with title: {}", event.getTitle());
        }

        eventRepository.saveAll(completedEvents);

        log.info("Successfully marked {} events completed", completedEvents.size());
    }

    // ── Close expired enrollments ─────────────────────────────────────────────
    // Changes: event.enrollmentStatus = "CLOSED"
    // Stale caches: EVENTS_BY_ENROLLMENT_STATUS, ALL_EVENTS, EVENT_BY_ID,
    //               MY_EVENTS, EVENTS_BY_CREATOR, EVENTS_BY_TARGET_TYPE, etc.
    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.EVENT_BY_ID,                 allEntries = true),
            @CacheEvict(value = CacheConfig.ALL_EVENTS,                  allEntries = true),
            @CacheEvict(value = CacheConfig.MY_EVENTS,                   allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ENROLLMENT_STATUS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_STATUS,            allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_TYPE,       allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_CREATOR,           allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ORGANIZER,         allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_DATA,       allEntries = true),
    })
    public void closeExpiredEnrollments() {
        log.info("Running scheduled task: Checking for expired enrollments");

        LocalDateTime now = LocalDateTime.now();

        List<Events> expiredEvents = eventRepository
                .findByEnrollmentStatusAndEnrollmentDeadlineBefore("OPEN", now);

        if (expiredEvents.isEmpty()) {
            log.info("No enrollments to close");
            return;
        }

        log.info("Found {} events with expired enrollment deadlines", expiredEvents.size());

        for (Events event : expiredEvents) {
            event.setEnrollmentStatus("CLOSED");
            log.info("Closed enrollment for event: {} (ID: {})", event.getTitle(), event.getEventId());
        }

        eventRepository.saveAll(expiredEvents);

        log.info("Successfully closed {} enrollments", expiredEvents.size());
    }

    // ── Daily cleanup (delegates — eviction handled by closeExpiredEnrollments) ─
    // NOTE: because Spring AOP uses a proxy, calling this.closeExpiredEnrollments()
    // from within the same bean would bypass the proxy and skip @CacheEvict.
    // The @Caching annotations are therefore repeated here so eviction fires
    // regardless of which method is the entry point.
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.EVENT_BY_ID,                 allEntries = true),
            @CacheEvict(value = CacheConfig.ALL_EVENTS,                  allEntries = true),
            @CacheEvict(value = CacheConfig.MY_EVENTS,                   allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ENROLLMENT_STATUS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_STATUS,            allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_TYPE,       allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_CREATOR,           allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ORGANIZER,         allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_DATA,       allEntries = true),
    })
    public void dailyEnrollmentCleanup() {
        log.info("Running daily enrollment cleanup task");
        closeExpiredEnrollments();
    }
}