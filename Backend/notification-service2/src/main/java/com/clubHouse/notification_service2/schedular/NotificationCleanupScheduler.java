package com.clubHouse.notification_service2.schedular;

import com.clubHouse.notification_service2.model.Notification;
import com.clubHouse.notification_service2.repository.NotificationRepository;
import com.clubHouse.notification_service2.repository.NotificationTargetsRepository;
import com.clubHouse.notification_service2.repository.UserSeenNotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationCleanupScheduler {

    private final NotificationRepository notificationRepository;
    private final NotificationTargetsRepository nTargetsRepository;
    private final UserSeenNotificationRepository userSeenRepository;

    /**
     * Runs once every day at 2:00 AM.
     *
     * Permanently deletes notifications that are:
     *   - Older than 1 year (createdAt < now - 1 year)
     *   - AND either:
     *       (a) Have a validUntil that has already passed  — truly expired
     *       (b) Were manually deactivated (isActive = false) — admin closed them
     *
     * Cascade order matters:
     *   1. Delete NotificationTargets rows (FK references notification)
     *   2. Delete UserSeenNotification rows (FK references notificationId)
     *   3. Delete the Notification itself
     *
     * Done in batches of 100 to avoid a single massive DELETE locking the table.
     */
    @Scheduled(cron = "0 0 2 * * *")   // 2:00 AM every day
    @Transactional
    public void cleanupOldNotifications() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cutoff = now.minusYears(1);

        log.info("Starting notification cleanup — cutoff date: {}", cutoff);

        List<Notification> eligible = notificationRepository.findEligibleForCleanup(now, cutoff);

        if (eligible.isEmpty()) {
            log.info("Notification cleanup complete — nothing to delete");
            return;
        }

        log.info("Found {} notifications eligible for deletion", eligible.size());

        // Process in batches of 100 to avoid large single-transaction deletes
        int batchSize = 100;
        int totalDeleted = 0;

        for (int i = 0; i < eligible.size(); i += batchSize) {
            List<Notification> batch = eligible.subList(i, Math.min(i + batchSize, eligible.size()));
            List<Long> batchIds = batch.stream()
                    .map(Notification::getNotificationId)
                    .toList();

            try {
                // 1. Delete child rows first to avoid FK violations
                nTargetsRepository.deleteByNotificationIds(batchIds);
                userSeenRepository.deleteByNotificationIds(batchIds);

                // 2. Delete the notifications themselves
                notificationRepository.deleteByIds(batchIds);

                totalDeleted += batchIds.size();
                log.debug("Deleted batch of {} notifications (ids: {})", batchIds.size(), batchIds);

            } catch (Exception e) {
                // Log and continue — don't let one bad batch abort the entire cleanup
                log.error("Failed to delete batch starting at index {}: {}", i, e.getMessage(), e);
            }
        }

        log.info("Notification cleanup complete — deleted {} of {} eligible notifications",
                totalDeleted, eligible.size());
    }
}