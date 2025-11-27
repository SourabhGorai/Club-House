package com.notificationservice.notification_service.schedular;

import com.notificationservice.notification_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled tasks for notification management
 */
@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class NotificationScheduler {

    private final NotificationService notificationService;

    @Value("${notification.retention.days:90}")
    private int retentionDays;

    /**
     * Process expired notifications every hour
     */
    @Scheduled(cron = "0 0 * * * *")
    public void processExpiredNotifications() {
        log.info("Starting scheduled task: Process expired notifications");

        try {
            notificationService.processExpiredNotifications();
            log.info("Completed: Process expired notifications");
        } catch (Exception e) {
            log.error("Error processing expired notifications", e);
        }
    }

    /**
     * Archive old notifications daily at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void archiveOldNotifications() {
        log.info("Starting scheduled task: Archive old notifications (older than {} days)", retentionDays);

        try {
            notificationService.archiveOldNotifications(retentionDays);
            log.info("Completed: Archive old notifications");
        } catch (Exception e) {
            log.error("Error archiving old notifications", e);
        }
    }
}