package com.notificationservice.notification_service.service;

import com.notificationservice.notification_service.client.ProfileServiceClient;
import com.notificationservice.notification_service.client.UserServiceClient;
import com.notificationservice.notification_service.dto.*;
import com.notificationservice.notification_service.exception.NotificationNotFoundException;
import com.notificationservice.notification_service.exception.UnauthorizedAccessException;
import com.notificationservice.notification_service.exception.ValidationException;
import com.notificationservice.notification_service.mapper.NotificationMapper;
import com.notificationservice.notification_service.model.*;
import com.notificationservice.notification_service.repository.NotificationReadStatusRepository;
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
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationReadStatusRepository readStatusRepository;
    private final UserServiceClient userServiceClient;
    private final ProfileServiceClient profileServiceClient;
    private final NotificationMapper mapper;

    @Transactional
    public NotificationResponse createNotification(NotificationCreateRequest request) {
        log.info("Creating notification of type: {} by sender: {}",
                request.getNotificationType(), request.getSenderPrn());

        validateUser(request.getSenderPrn());
        validateNotificationRequest(request);

        ProfileSummaryResponse senderProfile = profileServiceClient.getProfileSummary(request.getSenderPrn());

        Notification notification = mapper.toEntity(request);

        notification.setSenderName(senderProfile.getFullName());
        notification.setCreatedAt(LocalDateTime.now());
        notification.setUpdatedAt(LocalDateTime.now());

        if (request.getNotificationType() == NotificationType.PERSONAL) {
            validateUser(request.getRecipientPrn());
            ProfileSummaryResponse recipientProfile = profileServiceClient.getProfileSummary(request.getRecipientPrn());
            notification.setRecipientName(recipientProfile.getFullName());
        }

        if (request.getScheduledFor() != null && request.getScheduledFor().isAfter(LocalDateTime.now())) {
            notification.setIsScheduled(true);
            notification.setStatus(NotificationStatus.ACTIVE);
        }

        Notification saved = notificationRepository.save(notification);
        log.info("Notification created successfully with ID: {}", saved.getId());

        return mapper.toResponse(saved, false, null);
    }

    @Transactional(readOnly = true)
    public PagedNotificationResponse getUserNotifications(String prn, Boolean isRead,
                                                          Integer page, Integer size) {
        log.debug("Fetching notifications for user: {}, isRead: {}", prn, isRead);

        validateUser(prn);

        ProfileSummaryResponse profile = profileServiceClient.getProfileSummary(prn);
        List<String> userClubs = profileServiceClient.getUserClubs(prn);

        // If no read filter, use regular pagination
        if (isRead == null) {
            return getUserNotificationsWithoutFilter(prn, userClubs, profile, page, size);
        }

        // If read filter is applied, we need to handle it differently
        return getUserNotificationsWithReadFilter(prn, userClubs, profile, isRead, page, size);
    }

    /**
     * Get notifications WITHOUT read filter (uses MongoDB pagination)
     */
    private PagedNotificationResponse getUserNotificationsWithoutFilter(
            String prn, List<String> userClubs, ProfileSummaryResponse profile,
            Integer page, Integer size) {

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Notification> notificationPage = notificationRepository.findRelevantNotifications(
                prn, userClubs, profile.getDepartment(), profile.getYear(), pageable);

        // Get read statuses for this user
        Map<String, NotificationReadStatus> readStatusMap = readStatusRepository.findByUserPrn(prn)
                .stream()
                .collect(Collectors.toMap(
                        NotificationReadStatus::getNotificationId,
                        rs -> rs,
                        (existing, replacement) -> existing
                ));

        // Map notifications with read status
        List<NotificationResponse> notifications = notificationPage.getContent().stream()
                .map(n -> {
                    NotificationReadStatus readStatus = readStatusMap.get(n.getId());
                    return mapper.toResponse(n, readStatus);
                })
                .collect(Collectors.toList());

        return createPagedResponse(notifications, page, size,
                notificationPage.getTotalElements(), notificationPage.getTotalPages());
    }

    /**
     * Get notifications WITH read filter (custom pagination after filtering)
     */
    private PagedNotificationResponse getUserNotificationsWithReadFilter(
            String prn, List<String> userClubs, ProfileSummaryResponse profile,
            Boolean isRead, Integer page, Integer size) {

        // Get ALL relevant notifications (not paginated yet)
        List<Notification> allNotifications = notificationRepository.findRelevantNotificationIds(
                prn, userClubs, profile.getDepartment(), profile.getYear());

        // Get read statuses for this user
        Set<String> readNotificationIds = readStatusRepository.findByUserPrn(prn).stream()
                .map(NotificationReadStatus::getNotificationId)
                .collect(Collectors.toSet());

        // Filter notifications based on read status
        List<Notification> filteredNotifications = allNotifications.stream()
                .filter(n -> {
                    boolean hasBeenRead = readNotificationIds.contains(n.getId());
                    return hasBeenRead == isRead;
                })
                .sorted(Comparator.comparing(Notification::getCreatedAt).reversed())
                .collect(Collectors.toList());

        // Calculate pagination manually
        int totalElements = filteredNotifications.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, totalElements);

        // Get the page subset
        List<Notification> pageNotifications = fromIndex < totalElements
                ? filteredNotifications.subList(fromIndex, toIndex)
                : Collections.emptyList();

        // Get read statuses for the notifications in this page
        Map<String, NotificationReadStatus> readStatusMap = readStatusRepository
                .findByNotificationIdInAndUserPrn(
                        pageNotifications.stream().map(Notification::getId).collect(Collectors.toList()),
                        prn
                )
                .stream()
                .collect(Collectors.toMap(
                        NotificationReadStatus::getNotificationId,
                        rs -> rs,
                        (existing, replacement) -> existing
                ));

        // Map to response
        List<NotificationResponse> responses = pageNotifications.stream()
                .map(n -> {
                    NotificationReadStatus readStatus = readStatusMap.get(n.getId());
                    return mapper.toResponse(n, readStatus);
                })
                .collect(Collectors.toList());

        return createPagedResponse(responses, page, size, totalElements, totalPages);
    }

    @Transactional
    public NotificationResponse getNotificationById(String id, String requesterPrn) {
        log.debug("Fetching notification: {} for user: {}", id, requesterPrn);

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException(id));

        if (!canAccessNotification(notification, requesterPrn)) {
            throw new UnauthorizedAccessException("You do not have access to this notification");
        }

        notification.setViewCount(notification.getViewCount() + 1);
        notificationRepository.save(notification);

        NotificationReadStatus readStatus = readStatusRepository
                .findByNotificationIdAndUserPrn(id, requesterPrn)
                .orElse(null);

        return mapper.toResponse(notification, readStatus);
    }

    @Transactional
    public NotificationResponse markAsRead(String id, String requesterPrn) {
        log.info("Marking notification {} as read by user: {}", id, requesterPrn);

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException(id));

        if (!canAccessNotification(notification, requesterPrn)) {
            throw new UnauthorizedAccessException("You do not have access to this notification");
        }

        boolean alreadyRead = readStatusRepository.existsByNotificationIdAndUserPrn(id, requesterPrn);

        if (!alreadyRead) {
            NotificationReadStatus readStatus = NotificationReadStatus.builder()
                    .notificationId(id)
                    .userPrn(requesterPrn)
                    .readAt(LocalDateTime.now())
                    .createdAt(LocalDateTime.now())
                    .build();

            readStatusRepository.save(readStatus);
            log.info("Notification {} marked as read by user {}", id, requesterPrn);
        }

        NotificationReadStatus readStatus = readStatusRepository
                .findByNotificationIdAndUserPrn(id, requesterPrn)
                .orElse(null);

        return mapper.toResponse(notification, readStatus);
    }

    @Transactional
    public void bulkMarkAsRead(BulkMarkReadRequest request, String requesterPrn) {
        log.info("Bulk marking {} notifications as read by user: {}",
                request.getNotificationIds().size(), requesterPrn);

        List<Notification> notifications = notificationRepository.findAllById(request.getNotificationIds());

        List<NotificationReadStatus> newReadStatuses = new ArrayList<>();

        for (Notification notification : notifications) {
            if (canAccessNotification(notification, requesterPrn)) {
                boolean alreadyRead = readStatusRepository.existsByNotificationIdAndUserPrn(
                        notification.getId(), requesterPrn);

                if (!alreadyRead) {
                    NotificationReadStatus readStatus = NotificationReadStatus.builder()
                            .notificationId(notification.getId())
                            .userPrn(requesterPrn)
                            .readAt(LocalDateTime.now())
                            .createdAt(LocalDateTime.now())
                            .build();

                    newReadStatuses.add(readStatus);
                }
            }
        }

        if (!newReadStatuses.isEmpty()) {
            readStatusRepository.saveAll(newReadStatuses);
        }

        log.info("Bulk mark as read completed - marked {} notifications", newReadStatuses.size());
    }

    @Transactional
    public void deleteNotification(String id, String requesterPrn) {
        log.info("Deleting notification: {} by user: {}", id, requesterPrn);

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException(id));

        if (!notification.getSenderPrn().equals(requesterPrn)) {
            throw new UnauthorizedAccessException("Only the sender can delete this notification");
        }

        notification.setIsDeleted(true);
        notification.setDeletedAt(LocalDateTime.now());
        notification.setUpdatedAt(LocalDateTime.now());
        notificationRepository.save(notification);

        readStatusRepository.deleteByNotificationId(id);

        log.info("Notification {} soft deleted and read statuses cleaned", id);
    }

    @Transactional(readOnly = true)
    public PagedNotificationResponse getSentNotifications(String senderPrn, Integer page, Integer size) {
        log.debug("Fetching sent notifications for user: {}", senderPrn);

        validateUser(senderPrn);

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Notification> notificationPage = notificationRepository
                .findBySenderPrnAndIsDeletedFalse(senderPrn, pageable);

        List<NotificationResponse> responses = notificationPage.getContent().stream()
                .map(n -> {
                    NotificationResponse response = mapper.toResponse(n);
                    if (n.getNotificationType() != NotificationType.PERSONAL) {
                        Long totalReaders = readStatusRepository.countByNotificationId(n.getId());
                        response.setTotalReaders(totalReaders);
                    }
                    return response;
                })
                .collect(Collectors.toList());

        return createPagedResponse(responses, page, size,
                notificationPage.getTotalElements(), notificationPage.getTotalPages());
    }

    @Transactional(readOnly = true)
    public Long getUnreadCount(String prn) {
        log.debug("Getting unread count for user: {}", prn);

        validateUser(prn);

        ProfileSummaryResponse profile = profileServiceClient.getProfileSummary(prn);
        List<String> userClubs = profileServiceClient.getUserClubs(prn);

        List<Notification> relevantNotifications = notificationRepository.findRelevantNotificationIds(
                prn, userClubs, profile.getDepartment(), profile.getYear());

        Set<String> relevantIds = relevantNotifications.stream()
                .map(Notification::getId)
                .collect(Collectors.toSet());

        Set<String> readIds = readStatusRepository.findByUserPrn(prn).stream()
                .map(NotificationReadStatus::getNotificationId)
                .collect(Collectors.toSet());

        long unreadCount = relevantIds.stream()
                .filter(id -> !readIds.contains(id))
                .count();

        log.debug("User {} has {} unread notifications", prn, unreadCount);
        return unreadCount;
    }

    @Transactional(readOnly = true)
    public NotificationStatistics getStatistics() {
        log.debug("Fetching notification statistics");

        long totalNotifications = notificationRepository.count();

        long activeCount = notificationRepository.countByStatusAndIsDeletedFalse(NotificationStatus.ACTIVE);
        long expiredCount = notificationRepository.countByStatusAndIsDeletedFalse(NotificationStatus.EXPIRED);
        long archivedCount = notificationRepository.countByStatusAndIsDeletedFalse(NotificationStatus.ARCHIVED);

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

        long totalReads = readStatusRepository.count();

        log.info("Statistics - Total: {}, Total Reads: {}, Active: {}",
                totalNotifications, totalReads, activeCount);

        return NotificationStatistics.builder()
                .totalNotifications(totalNotifications)
                .unreadCount(null)
                .readCount(totalReads)
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
                break;
        }
    }

    private boolean canAccessNotification(Notification notification, String requesterPrn) {
        if (notification.getSenderPrn().equals(requesterPrn)) {
            return true;
        }

        if (notification.getNotificationType() == NotificationType.GLOBAL) {
            return true;
        }

        if (notification.getNotificationType() == NotificationType.PERSONAL) {
            return notification.getRecipientPrn().equals(requesterPrn);
        }

        ProfileSummaryResponse profile = profileServiceClient.getProfileSummary(requesterPrn);
        List<String> userClubs = profileServiceClient.getUserClubs(requesterPrn);

        if (notification.getTargetClubs() != null && !notification.getTargetClubs().isEmpty()) {
            boolean hasClubAccess = notification.getTargetClubs().stream()
                    .anyMatch(userClubs::contains);
            if (hasClubAccess) return true;
        }

        if (notification.getTargetDepartments() != null &&
                notification.getTargetDepartments().contains(profile.getDepartment())) {
            return true;
        }

        if (notification.getTargetYears() != null &&
                notification.getTargetYears().contains(profile.getYear())) {
            return true;
        }

        return false;
    }

    private PagedNotificationResponse createPagedResponse(List<NotificationResponse> content,
                                                          int page, int size,
                                                          long totalElements, int totalPages) {
        return PagedNotificationResponse.builder()
                .content(content)
                .pageNumber(page)
                .pageSize(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .isFirst(page == 0)
                .isLast(page >= totalPages - 1)
                .build();
    }
}