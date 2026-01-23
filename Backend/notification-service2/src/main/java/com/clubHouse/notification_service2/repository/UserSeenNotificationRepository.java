package com.clubHouse.notification_service2.repository;

import com.clubHouse.notification_service2.model.UserSeenNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserSeenNotificationRepository extends JpaRepository<UserSeenNotification, Long> {

    // Check if user has already seen a notification
    Optional<UserSeenNotification> findByPrnAndNotificationId(
            String prn,
            Long notificationId
    );

    // Fetch all seen notifications for a user
    List<UserSeenNotification> findByPrn(String prn);
}
