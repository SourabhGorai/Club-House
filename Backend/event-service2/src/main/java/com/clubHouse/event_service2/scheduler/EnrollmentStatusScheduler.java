package com.clubHouse.event_service2.scheduler;

import com.clubHouse.event_service2.model.Events;
import com.clubHouse.event_service2.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    /**
     * Runs every 5 minutes to check and close enrollments that have passed their deadline
     * Cron: "0 5 * * * *" = At second 0 of every 5th minute
     */
    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    public void closeExpiredEnrollments() {
        log.info("🕐 Running scheduled task: Checking for expired enrollments");

        LocalDateTime now = LocalDateTime.now();
        
        // Find all events with OPEN enrollment status where deadline has passed
        List<Events> expiredEvents = eventRepository.findByEnrollmentStatusAndEnrollmentDeadlineBefore("OPEN", now);

        if (expiredEvents.isEmpty()) {
            log.info("✅ No enrollments to close");
            return;
        }

        log.info("📋 Found {} events with expired enrollment deadlines", expiredEvents.size());

        // Update all expired enrollments to CLOSED
        for (Events event : expiredEvents) {
            event.setEnrollmentStatus("CLOSED");
            log.info("🔒 Closed enrollment for event: {} (ID: {})", event.getTitle(), event.getEventId());
        }

        eventRepository.saveAll(expiredEvents);

        log.info("✅ Successfully closed {} enrollments", expiredEvents.size());
    }

    /**
     * Optional: Run at midnight to close all enrollments for the day
     * Cron: "0 0 0 * * *" = At 00:00:00 every day
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void dailyEnrollmentCleanup() {
        log.info("🌙 Running daily enrollment cleanup task");
        closeExpiredEnrollments();
    }
}