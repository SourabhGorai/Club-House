package com.clubHouse.notification_service2.repository;

import com.clubHouse.notification_service2.model.Notification;
import com.clubHouse.notification_service2.model.UserSeenNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserSeenNotificationRepository extends JpaRepository<UserSeenNotification, Long> {

    List<UserSeenNotification> findByPrnAndNotificationIdIn(String prn, List<Long> notificationIds);

    Optional<UserSeenNotification> findByPrnAndNotificationId(String prn, Long notificationId);

    @Modifying
    @Query("DELETE FROM user_seen_notification u WHERE u.notificationId = :notificationId")
    void deleteByNotificationId(@Param("notificationId") Long notificationId);

    /**
     * Count unread notifications for a user (useful for badge count endpoint).
     */
    @Query("""
            SELECT COUNT(u) FROM user_seen_notification u
            WHERE u.prn = :prn AND u.isRead = false
            """)
    long countUnreadByPrn(@Param("prn") String prn);

    @Modifying
    @Query("DELETE FROM user_seen_notification u WHERE u.notificationId IN :notificationIds")
    void deleteByNotificationIds(@Param("notificationIds") List<Long> notificationIds);

    List<UserSeenNotification> getByPrn(String prn);
}
