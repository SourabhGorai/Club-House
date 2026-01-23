package com.clubHouse.notification_service2.repository;

import com.clubHouse.notification_service2.model.Notification;
import com.clubHouse.notification_service2.model.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Fetch all active notifications
    List<Notification> findByIsActiveTrue();

    // Fetch active notifications that should be visible now
    @Query("""
        SELECT n FROM notification_table n
        WHERE n.isActive = true
        AND (n.triggerAt IS NULL OR n.triggerAt <= :now)
        AND (n.validUntil IS NULL OR n.validUntil >= :now)
    """)
    List<Notification> findVisibleNotifications(LocalDateTime now);

    // Fetch scheduled reminders that are due
    @Query("""
        SELECT n FROM notification_table n
        WHERE n.isActive = true
        AND n.triggerAt IS NOT NULL
        AND n.triggerAt <= :now
    """)
    List<Notification> findDueReminders(LocalDateTime now);

    // Fetch notifications by type
    List<Notification> findByNotificationType(NotificationType notificationType);
}
