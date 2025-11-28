package com.notificationservice.notification_service.repository;

import com.notificationservice.notification_service.model.NotificationReadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface NotificationReadStatusRepository extends MongoRepository<NotificationReadStatus, String> {

    // ========== Basic CRUD Operations ==========

    /**
     * Check if a user has read a specific notification
     */
    boolean existsByNotificationIdAndUserPrn(String notificationId, String userPrn);

    /**
     * Get read status for a specific user and notification
     */
    Optional<NotificationReadStatus> findByNotificationIdAndUserPrn(String notificationId, String userPrn);

    // ========== User-Centric Queries ==========

    /**
     * Get all read statuses for a user
     */
    List<NotificationReadStatus> findByUserPrn(String userPrn);

    /**
     * Get all read statuses for a user with pagination
     */
    Page<NotificationReadStatus> findByUserPrn(String userPrn, Pageable pageable);

    /**
     * Get read notification IDs for a user (efficient - only returns IDs)
     */
    @Query(value = "{ 'userPrn': ?0 }", fields = "{ 'notificationId': 1 }")
    List<NotificationReadStatus> findNotificationIdsByUserPrn(String userPrn);

    /**
     * Count total notifications read by a user
     */
    Long countByUserPrn(String userPrn);

    /**
     * Get read statuses for a user within a date range
     */
    List<NotificationReadStatus> findByUserPrnAndReadAtBetween(
            String userPrn, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Get recently read notifications for a user (last N days)
     */
    @Query("{ 'userPrn': ?0, 'readAt': { $gte: ?1 } }")
    List<NotificationReadStatus> findRecentlyReadByUser(String userPrn, LocalDateTime since);

    // ========== Notification-Centric Queries ==========

    /**
     * Get all read statuses for a notification (useful for analytics)
     */
    List<NotificationReadStatus> findByNotificationId(String notificationId);

    /**
     * Get all read statuses for a notification with pagination
     */
    Page<NotificationReadStatus> findByNotificationId(String notificationId, Pageable pageable);

    /**
     * Count how many users have read a specific notification
     */
    Long countByNotificationId(String notificationId);

    /**
     * Get read statuses for multiple notifications
     */
    List<NotificationReadStatus> findByNotificationIdIn(List<String> notificationIds);

    /**
     * Get read statuses for multiple notifications by a specific user
     */
    List<NotificationReadStatus> findByNotificationIdInAndUserPrn(
            List<String> notificationIds, String userPrn);

    /**
     * Check if any of the given notifications have been read by the user
     */
    @Query("{ 'notificationId': { $in: ?0 }, 'userPrn': ?1 }")
    List<NotificationReadStatus> findReadStatusesForNotifications(
            List<String> notificationIds, String userPrn);

    // ========== Bulk Operations ==========

    /**
     * Delete all read statuses for a notification (cleanup when notification is deleted)
     */
    void deleteByNotificationId(String notificationId);

    /**
     * Delete read status for a specific user and notification
     */
    void deleteByNotificationIdAndUserPrn(String notificationId, String userPrn);

    /**
     * Bulk delete read statuses for multiple notifications
     */
    void deleteByNotificationIdIn(List<String> notificationIds);

    /**
     * Delete all read statuses for a user (cleanup when user is deleted)
     */
    void deleteByUserPrn(String userPrn);

    /**
     * Delete old read statuses (for data cleanup)
     */
    void deleteByReadAtBefore(LocalDateTime cutoffDate);

    // ========== Analytics Queries ==========

    /**
     * Get top readers (users who have read the most notifications)
     */
    @Query(value = "{ 'readAt': { $gte: ?0 } }",
            fields = "{ 'userPrn': 1 }")
    List<NotificationReadStatus> findTopReadersSince(LocalDateTime since);

    /**
     * Get read count by notification type (requires aggregation in service layer)
     */
    @Query("{ 'readAt': { $gte: ?0, $lte: ?1 } }")
    List<NotificationReadStatus> findReadsBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Get users who read a specific notification
     */
    @Query(value = "{ 'notificationId': ?0 }", fields = "{ 'userPrn': 1, 'readAt': 1 }")
    List<NotificationReadStatus> findReadersByNotification(String notificationId);

    /**
     * Count total reads in a date range
     */
    Long countByReadAtBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Get read statuses for notifications created by a specific sender
     * Note: This requires joining with notifications collection in service layer
     */

    // ========== Advanced Queries ==========

    /**
     * Find users who haven't read a notification yet (requires service layer logic)
     * This is a complex query that needs to be implemented in the service
     */

    /**
     * Get read rate for a notification (percentage of target audience who read it)
     * This also requires service layer logic to compare with target audience
     */

    /**
     * Check if multiple users have read a notification
     */
    @Query("{ 'notificationId': ?0, 'userPrn': { $in: ?1 } }")
    List<NotificationReadStatus> findByNotificationIdAndUserPrnIn(
            String notificationId, List<String> userPrns);

    /**
     * Get all read statuses ordered by read time (most recent first)
     */
    List<NotificationReadStatus> findAllByOrderByReadAtDesc(Pageable pageable);

    /**
     * Find read statuses by multiple notification IDs and get count per notification
     * Returns list that can be grouped in service layer
     */
    @Query(value = "{ 'notificationId': { $in: ?0 } }",
            fields = "{ 'notificationId': 1, '_id': 0 }")
    List<NotificationReadStatus> countReadsByNotificationIds(List<String> notificationIds);
}