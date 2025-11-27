package com.notificationservice.notification_service.service;

import com.notificationservice.notification_service.client.ProfileServiceClient;
import com.notificationservice.notification_service.client.UserServiceClient;
import com.notificationservice.notification_service.dto.*;
import com.notificationservice.notification_service.exception.NotificationNotFoundException;
import com.notificationservice.notification_service.exception.UnauthorizedAccessException;
import com.notificationservice.notification_service.exception.ValidationException;
import com.notificationservice.notification_service.mapper.NotificationMapper;
import com.notificationservice.notification_service.model.Notification;
import com.notificationservice.notification_service.model.NotificationPriority;
import com.notificationservice.notification_service.model.NotificationStatus;
import com.notificationservice.notification_service.model.NotificationType;
import com.notificationservice.notification_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserServiceClient userServiceClient;
    private final ProfileServiceClient profileServiceClient;
    private final NotificationMapper mapper;

    /**
     * Creates a new notification
     */
    @Transactional
    public NotificationResponse createNotification(NotificationCreateRequest request) {
        log.info("Creating notification of type: {} by sender: {}",
                request.getNotificationType(), request.getSenderPrn());

        // Validate sender exists
        validateUser(request.getSenderPrn());

        // Validate notification type requirements
        validateNotificationRequest(request);

        // Fetch sender details
        ProfileSummaryResponse senderProfile = profileServiceClient.getProfileSummary(request.getSenderPrn());

        // Build notification
        Notification notification = mapper.toEntity(request);
        notification.setSenderName(senderProfile.getFullName());
        notification.setCreatedAt(LocalDateTime.now());
        notification.setUpdatedAt(LocalDateTime.now());

        // Handle recipient for personal notifications
        if (request.getNotificationType() == NotificationType.PERSONAL) {
            validateUser(request.getRecipientPrn());
            ProfileSummaryResponse recipientProfile = profileServiceClient.getProfileSummary(request.getRecipientPrn());
            notification.setRecipientName(recipientProfile.getFullName());
        }

        // Handle scheduled notifications
        if (request.getScheduledFor() != null && request.getScheduledFor().isAfter(LocalDateTime.now())) {
            notification.setIsScheduled(true);
            notification.setStatus(NotificationStatus.ACTIVE);
        }

        Notification saved = notificationRepository.save(notification);
        log.info("Notification created successfully with ID: {}", saved.getId());

        return mapper.toResponse(saved);
    }

    /**
     * Gets notifications for a specific user (includes global, personal, club, and department)
     */
    @Transactional(readOnly = true)
    public PagedNotificationResponse getUserNotifications(String prn, Boolean isRead,
                                                          Integer page, Integer size) {
        log.debug("Fetching notifications for user: {}, isRead: {}", prn, isRead);

        validateUser(prn);

        // Get user profile to determine clubs and department
        ProfileSummaryResponse profile = profileServiceClient.getProfileSummary(prn);
        List<String> userClubs = profileServiceClient.getUserClubs(prn);

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        // Find all relevant notifications
        Page<Notification> notificationPage = notificationRepository.findRelevantNotifications(
                prn, userClubs, profile.getDepartment(), profile.getYear(), pageable);

        // Filter by read status if specified
        if (isRead != null) {
            List<Notification> filtered = notificationPage.getContent().stream()
                    .filter(n -> n.getIsRead().equals(isRead))
                    .collect(Collectors.toList());

            return createPagedResponse(filtered, page, size, filtered.size());
        }

        return createPagedResponse(notificationPage);
    }

    /**
     * Gets a single notification by ID
     */
    @Transactional
    public NotificationResponse getNotificationById(String id, String requesterPrn) {
        log.debug("Fetching notification: {} for user: {}", id, requesterPrn);

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException(id));

        // Check if user has access to this notification
        if (!canAccessNotification(notification, requesterPrn)) {
            throw new UnauthorizedAccessException("You do not have access to this notification");
        }

        // Increment view count
        notification.setViewCount(notification.getViewCount() + 1);
        notificationRepository.save(notification);

        return mapper.toResponse(notification);
    }

    /**
     * Marks a notification as read
     */
    @Transactional
    public NotificationResponse markAsRead(String id, String requesterPrn) {
        log.info("Marking notification {} as read by user: {}", id, requesterPrn);

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException(id));

        if (!canAccessNotification(notification, requesterPrn)) {
            throw new UnauthorizedAccessException("You do not have access to this notification");
        }

        if (!notification.getIsRead()) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification.setUpdatedAt(LocalDateTime.now());
            notificationRepository.save(notification);
            log.info("Notification {} marked as read", id);
        }

        return mapper.toResponse(notification);
    }

    /**
     * Marks multiple notifications as read
     */
    @Transactional
    public void bulkMarkAsRead(BulkMarkReadRequest request, String requesterPrn) {
        log.info("Bulk marking {} notifications as read by user: {}",
                request.getNotificationIds().size(), requesterPrn);

        List<Notification> notifications = notificationRepository.findAllById(request.getNotificationIds());

        for (Notification notification : notifications) {
            if (canAccessNotification(notification, requesterPrn) && !notification.getIsRead()) {
                notification.setIsRead(true);
                notification.setReadAt(LocalDateTime.now());
                notification.setUpdatedAt(LocalDateTime.now());
            }
        }

        notificationRepository.saveAll(notifications);
        log.info("Bulk mark as read completed");
    }

    /**
     * Deletes a notification (soft delete)
     */
    @Transactional
    public void deleteNotification(String id, String requesterPrn) {
        log.info("Deleting notification: {} by user: {}", id, requesterPrn);

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException(id));

        // Only sender or recipient can delete
        if (!notification.getSenderPrn().equals(requesterPrn) &&
                !requesterPrn.equals(notification.getRecipientPrn())) {
            throw new UnauthorizedAccessException("You can only delete your own notifications");
        }

        notification.setIsDeleted(true);
        notification.setDeletedAt(LocalDateTime.now());
        notification.setUpdatedAt(LocalDateTime.now());
        notificationRepository.save(notification);

        log.info("Notification {} soft deleted", id);
    }

    /**
     * Gets notifications sent by a specific user
     */
    @Transactional(readOnly = true)
    public PagedNotificationResponse getSentNotifications(String senderPrn, Integer page, Integer size) {
        log.debug("Fetching sent notifications for user: {}", senderPrn);

        validateUser(senderPrn);

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Notification> notificationPage = notificationRepository
                .findBySenderPrnAndIsDeletedFalse(senderPrn, pageable);

        return createPagedResponse(notificationPage);
    }

    /**
     * Gets unread count for a user
     */
    @Transactional(readOnly = true)
    public Long getUnreadCount(String prn) {
        log.debug("Getting unread count for user: {}", prn);

        validateUser(prn);
        return notificationRepository.countByRecipientPrnAndIsReadFalseAndIsDeletedFalse(prn);
    }

    /**
     * Gets notification statistics
     */
    @Transactional(readOnly = true)
    public NotificationStatistics getStatistics() {
        log.debug("Fetching notification statistics");

        long totalNotifications = notificationRepository.count();

        // Using enum-based queries instead of string-based
        long activeCount = notificationRepository.countByStatusAndIsDeletedFalse(NotificationStatus.ACTIVE);
        long expiredCount = notificationRepository.countByStatusAndIsDeletedFalse(NotificationStatus.EXPIRED);
        long archivedCount = notificationRepository.countByStatusAndIsDeletedFalse(NotificationStatus.ARCHIVED);

        long unreadCount = notificationRepository.countByIsReadAndIsDeletedFalse(false);
        long readCount = notificationRepository.countByIsReadAndIsDeletedFalse(true);

        long globalNotifications = notificationRepository.countByNotificationTypeAndIsDeletedFalse(NotificationType.GLOBAL);
        long personalNotifications = notificationRepository.countByNotificationTypeAndIsDeletedFalse(NotificationType.PERSONAL);
        long clubNotifications = notificationRepository.countByNotificationTypeAndIsDeletedFalse(NotificationType.CLUB_SPECIFIC);
        long departmentNotifications = notificationRepository.countByNotificationTypeAndIsDeletedFalse(NotificationType.DEPARTMENT);
        long yearNotifications = notificationRepository.countByNotificationTypeAndIsDeletedFalse(NotificationType.YEAR_SPECIFIC);
        long clubAndYearNotifications = notificationRepository.countByNotificationTypeAndIsDeletedFalse(NotificationType.CLUB_AND_YEAR);
        long deptAndYearNotifications = notificationRepository.countByNotificationTypeAndIsDeletedFalse(NotificationType.DEPT_AND_YEAR);

        long urgentCount = notificationRepository.countByPriorityAndIsDeletedFalse(NotificationPriority.URGENT);
        long highPriorityCount = notificationRepository.countByPriorityAndIsDeletedFalse(NotificationPriority.HIGH);
        long normalPriorityCount = notificationRepository.countByPriorityAndIsDeletedFalse(NotificationPriority.NORMAL);
        long lowPriorityCount = notificationRepository.countByPriorityAndIsDeletedFalse(NotificationPriority.LOW);

        log.info("Statistics - Total: {}, Unread: {}, Read: {}, Active: {}",
                totalNotifications, unreadCount, readCount, activeCount);

        return NotificationStatistics.builder()
                .totalNotifications(totalNotifications)
                .unreadCount(unreadCount)
                .readCount(readCount)
                .activeCount(activeCount)
                .expiredCount(expiredCount)
                .archivedCount(archivedCount)
                .globalNotifications(globalNotifications)
                .personalNotifications(personalNotifications)
                .clubNotifications(clubNotifications)
                .departmentNotifications(departmentNotifications)
                .yearNotifications(yearNotifications + clubAndYearNotifications + deptAndYearNotifications)
                .urgentCount(urgentCount)
                .highPriorityCount(highPriorityCount)
                .normalPriorityCount(normalPriorityCount)
                .lowPriorityCount(lowPriorityCount)
                .build();
    }

    /**
     * Archives old notifications
     */
    @Transactional
    public void archiveOldNotifications(int daysOld) {
        log.info("Archiving notifications older than {} days", daysOld);

        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        List<Notification> oldNotifications = notificationRepository
                .findByCreatedAtBeforeAndIsDeletedFalse(cutoffDate);

        for (Notification notification : oldNotifications) {
            notification.setStatus(NotificationStatus.ARCHIVED);
            notification.setUpdatedAt(LocalDateTime.now());
        }

        notificationRepository.saveAll(oldNotifications);
        log.info("Archived {} old notifications", oldNotifications.size());
    }

    /**
     * Processes expired notifications
     */
    @Transactional
    public void processExpiredNotifications() {
        log.info("Processing expired notifications");

        List<Notification> expiredNotifications = notificationRepository
                .findExpiredNotifications(LocalDateTime.now());

        for (Notification notification : expiredNotifications) {
            notification.setStatus(NotificationStatus.EXPIRED);
            notification.setUpdatedAt(LocalDateTime.now());
        }

        notificationRepository.saveAll(expiredNotifications);
        log.info("Processed {} expired notifications", expiredNotifications.size());
    }

    // ========== Private Helper Methods ==========

    private void validateUser(String prn) {
        if (!userServiceClient.validateUser(prn)) {
            throw new ValidationException("User with PRN " + prn + " does not exist");
        }
    }

    private void validateNotificationRequest(NotificationCreateRequest request) {
        NotificationType type = request.getNotificationType();

        switch (type) {
            case PERSONAL:
                if (request.getRecipientPrn() == null || request.getRecipientPrn().isBlank()) {
                    throw new ValidationException("Recipient PRN is required for personal notifications");
                }
                break;
            case CLUB_SPECIFIC:
            case CLUB_AND_YEAR:
                if (request.getTargetClubs() == null || request.getTargetClubs().isEmpty()) {
                    throw new ValidationException("Target clubs are required for club-specific notifications");
                }
                break;
            case DEPARTMENT:
            case DEPT_AND_YEAR:
                if (request.getTargetDepartments() == null || request.getTargetDepartments().isEmpty()) {
                    throw new ValidationException("Target departments are required for department notifications");
                }
                break;
            case YEAR_SPECIFIC:
                if (request.getTargetYears() == null || request.getTargetYears().isEmpty()) {
                    throw new ValidationException("Target years are required for year-specific notifications");
                }
                break;
            case GLOBAL:
                // No additional validation needed
                break;
        }
    }

    private boolean canAccessNotification(Notification notification, String requesterPrn) {
        // Sender can always access
        if (notification.getSenderPrn().equals(requesterPrn)) {
            return true;
        }

        // Global notifications are accessible to all
        if (notification.getNotificationType() == NotificationType.GLOBAL) {
            return true;
        }

        // Personal notification - only recipient can access
        if (notification.getNotificationType() == NotificationType.PERSONAL) {
            return notification.getRecipientPrn().equals(requesterPrn);
        }

        // For club/department notifications, check user's profile
        ProfileSummaryResponse profile = profileServiceClient.getProfileSummary(requesterPrn);
        List<String> userClubs = profileServiceClient.getUserClubs(requesterPrn);

        // Check club membership
        if (notification.getTargetClubs() != null && !notification.getTargetClubs().isEmpty()) {
            boolean hasClubAccess = notification.getTargetClubs().stream()
                    .anyMatch(userClubs::contains);
            if (hasClubAccess) return true;
        }

        // Check department
        if (notification.getTargetDepartments() != null &&
                notification.getTargetDepartments().contains(profile.getDepartment())) {
            return true;
        }

        // Check year
        if (notification.getTargetYears() != null &&
                notification.getTargetYears().contains(profile.getYear())) {
            return true;
        }

        return false;
    }

    private PagedNotificationResponse createPagedResponse(Page<Notification> page) {
        List<NotificationResponse> content = page.getContent().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());

        return PagedNotificationResponse.builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .isFirst(page.isFirst())
                .isLast(page.isLast())
                .build();
    }

    private PagedNotificationResponse createPagedResponse(List<Notification> notifications,
                                                          int page, int size, long total) {
        List<NotificationResponse> content = notifications.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());

        return PagedNotificationResponse.builder()
                .content(content)
                .pageNumber(page)
                .pageSize(size)
                .totalElements(total)
                .totalPages((int) Math.ceil((double) total / size))
                .isFirst(page == 0)
                .isLast(content.size() < size)
                .build();
    }
}