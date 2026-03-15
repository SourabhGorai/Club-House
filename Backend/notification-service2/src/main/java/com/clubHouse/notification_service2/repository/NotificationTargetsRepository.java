package com.clubHouse.notification_service2.repository;

import com.clubHouse.notification_service2.model.Notification;
import com.clubHouse.notification_service2.model.NotificationTargets;
import com.clubHouse.notification_service2.model.TargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Modifying
    @Query("DELETE FROM NotificationTargets nt WHERE nt.notification.notificationId = :notificationId")
    void deleteByNotification_NotificationId(@Param("notificationId") Long notificationId);

    @Modifying
    @Query("DELETE FROM NotificationTargets nt WHERE nt.notification.notificationId IN :notificationIds")
    void deleteByNotificationIds(@Param("notificationIds") List<Long> notificationIds);

    @Query("""
            SELECT DISTINCT n FROM notification_table n
            LEFT JOIN NotificationTargets nt ON nt.notification.notificationId = n.notificationId
            WHERE
                n.targetType = 'GLOBAL'
                OR (nt.targetType = 'DEPARTMENT' AND nt.targetId = :deptId)
                OR (nt.targetType = 'CLUB'       AND nt.targetId IN :clubIds)
                OR (nt.targetType = 'YEAR'        AND nt.targetId = :year)
            """)
    List<com.clubHouse.notification_service2.model.Notification> findTargetedNotifications(
            @Param("deptId") Long deptId,
            @Param("clubIds") List<Long> clubIds,
            @Param("year") Integer year
    );

    List<NotificationTargets> findByNotification(Notification notification);
}
