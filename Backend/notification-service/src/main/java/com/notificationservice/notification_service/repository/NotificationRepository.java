package com.notificationservice.notification_service.repository;

import com.notificationservice.notification_service.model.Notification;
import com.notificationservice.notification_service.model.NotificationPriority;
import com.notificationservice.notification_service.model.NotificationStatus;
import com.notificationservice.notification_service.model.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    // Find by recipient (PERSONAL notifications only)
    Page<Notification> findByRecipientPrnAndIsDeletedFalse(String recipientPrn, Pageable pageable);

    List<Notification> findByRecipientPrnAndIsDeletedFalse(String recipientPrn);

    // Find by sender
    Page<Notification> findBySenderPrnAndIsDeletedFalse(String senderPrn, Pageable pageable);

    // Find global notifications
    Page<Notification> findByNotificationTypeAndIsDeletedFalseAndStatus(
            NotificationType type, NotificationStatus status, Pageable pageable);

    // Find by club
    @Query("{ 'targetClubs': ?0, 'isDeleted': false, 'status': 'ACTIVE' }")
    Page<Notification> findByTargetClub(String clubName, Pageable pageable);

    // Find by department
    @Query("{ 'targetDepartments': ?0, 'isDeleted': false, 'status': 'ACTIVE' }")
    Page<Notification> findByTargetDepartment(String department, Pageable pageable);

    // Find by year
    @Query("{ 'targetYears': ?0, 'isDeleted': false, 'status': 'ACTIVE' }")
    Page<Notification> findByTargetYear(Integer year, Pageable pageable);

    // Find expired notifications
    @Query("{ 'expiryDate': { $lt: ?0 }, 'status': 'ACTIVE', 'isDeleted': false }")
    List<Notification> findExpiredNotifications(LocalDateTime now);

    // Find scheduled notifications ready to send
    @Query("{ 'isScheduled': true, 'scheduledFor': { $lte: ?0 }, 'status': 'ACTIVE', 'isDeleted': false }")
    List<Notification> findScheduledNotificationsDue(LocalDateTime now);

    // Count by type
    Long countByNotificationTypeAndIsDeletedFalse(NotificationType type);

    // Count by status
    Long countByStatusAndIsDeletedFalse(NotificationStatus status);

    // Count by priority
    Long countByPriorityAndIsDeletedFalse(NotificationPriority priority);

    // Find old notifications for cleanup
    List<Notification> findByCreatedAtBeforeAndIsDeletedFalse(LocalDateTime cutoffDate);

    /**
     * Complex query to find all notifications relevant to a user
     * Includes: GLOBAL, PERSONAL (to them), their clubs, their department, their year
     */
    @Query("{ " +
            "$and: [" +
            "  { $or: [ " +
            "    { 'notificationType': 'GLOBAL' }, " +
            "    { 'recipientPrn': ?0 }, " +
            "    { 'targetClubs': { $in: ?1 } }, " +
            "    { 'targetDepartments': ?2 }, " +
            "    { 'targetYears': ?3 } " +
            "  ]}, " +
            "  { 'isDeleted': false }, " +
            "  { 'status': 'ACTIVE' } " +
            "]" +
            "}")
    Page<Notification> findRelevantNotifications(
            String recipientPrn,
            List<String> userClubs,
            String department,
            Integer year,
            Pageable pageable);

    /**
     * Get IDs of all notifications relevant to a user (for unread count calculation)
     */
    @Query(value = "{ " +
            "$and: [" +
            "  { $or: [ " +
            "    { 'notificationType': 'GLOBAL' }, " +
            "    { 'recipientPrn': ?0 }, " +
            "    { 'targetClubs': { $in: ?1 } }, " +
            "    { 'targetDepartments': ?2 }, " +
            "    { 'targetYears': ?3 } " +
            "  ]}, " +
            "  { 'isDeleted': false }, " +
            "  { 'status': 'ACTIVE' } " +
            "]" +
            "}", fields = "{ '_id': 1 }")
    List<Notification> findRelevantNotificationIds(
            String recipientPrn,
            List<String> userClubs,
            String department,
            Integer year);
}