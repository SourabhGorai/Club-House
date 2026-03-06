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
public class AttendanceSchedular {

    private final EventRepository eventRepository;

    /**
     * Runs every 5 minutes.
     * Finds all events where attendance is still active but the window end
     * time has already passed, and stops them.
     */
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
    public void closeExpiredAttendanceWindows() {
        log.info("Running scheduled task: Closing expired attendance windows");

        LocalDateTime now = LocalDateTime.now();

        // Find events that are still active but whose window has already ended
        List<Events> expiredEvents = eventRepository
                .findByAttendanceActiveAndAttendanceWindowEndBefore(true, now);

        if (expiredEvents.isEmpty()) {
            log.debug("No expired attendance windows found");
            return;
        }

        log.info("Found {} attendance windows to close", expiredEvents.size());

        for (Events event : expiredEvents) {
            event.stopAttendance();
            log.info("Closed attendance for event: '{}' (ID: {}) — window ended at {}",
                    event.getTitle(), event.getEventId(), event.getAttendanceWindowEnd());
        }

        eventRepository.saveAll(expiredEvents);

        log.info("Successfully closed {} attendance windows", expiredEvents.size());
    }
}