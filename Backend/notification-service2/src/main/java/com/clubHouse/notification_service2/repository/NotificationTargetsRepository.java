package com.clubHouse.notification_service2.repository;

import com.clubHouse.notification_service2.model.Notification;
import com.clubHouse.notification_service2.model.NotificationTargets;
import com.clubHouse.notification_service2.model.TargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;

public interface NotificationTargetsRepository extends JpaRepository<NotificationTargets, Long> {

    // Fetch all targets for a notification
    List<NotificationTargets> findByNotification_NotificationId(Long notificationId);

    // Fetch notifications targeted to a specific user
    List<NotificationTargets> findByTargetTypeAndTargetId(
            TargetType targetType,
            String targetId
    );

    // Fetch global notifications
    List<NotificationTargets> findByTargetType(TargetType targetType);

    // Make sure it looks exactly like this — fully typed return
    List<NotificationTargets> findByNotification_NotificationIdIn(List<Long> notificationIds);

    @Query("""
        SELECT nt.notification FROM NotificationTargets nt
        WHERE nt.notification.isActive = true
        AND (nt.notification.validUntil IS NULL 
             OR nt.notification.validUntil >= CURRENT_TIMESTAMP)
        AND (
              nt.targetType = 'GLOBAL'
           OR (nt.targetType = 'DEPARTMENT' AND nt.targetId = :deptId)
           OR (nt.targetType = 'CLUB' AND nt.targetId IN :clubIds)
        )
    """)
    List<Notification> findTargetedNotifications(
            Long deptId,
            List<Long> clubIds
    );
}
