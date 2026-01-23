package com.clubHouse.notification_service2.repository;

import com.clubHouse.notification_service2.model.NotificationTargets;
import com.clubHouse.notification_service2.model.TargetType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationTargetsRepository extends JpaRepository<NotificationTargets, Long> {

    // Fetch all targets for a notification
    List<NotificationTargets> findByNotification_NotificationId(Long notificationId);

    // Fetch notifications targeted to a specific user
    List<NotificationTargets> findByTargetTypeAndTargetValue(
            TargetType targetType,
            String targetValue
    );

    // Fetch global notifications
    List<NotificationTargets> findByTargetType(TargetType targetType);
}
