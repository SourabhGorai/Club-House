package com.clubHouse.notification_service2.service;

import com.clubHouse.notification_service2.client.ClubServiceClient;
import com.clubHouse.notification_service2.client.EventServiceClient;
import com.clubHouse.notification_service2.client.IndependentServiceClient;
import com.clubHouse.notification_service2.client.ProfileManagementServiceClient;
import com.clubHouse.notification_service2.dto.request.NotificationRequest;
import com.clubHouse.notification_service2.dto.request.NotificationUpdateRequest;
import com.clubHouse.notification_service2.dto.response.*;
import com.clubHouse.notification_service2.exception.NotFoundException;
import com.clubHouse.notification_service2.exception.ServiceException;
import com.clubHouse.notification_service2.mapper.NotificationMapper;
import com.clubHouse.notification_service2.model.*;
import com.clubHouse.notification_service2.repository.NotificationRepository;
import com.clubHouse.notification_service2.repository.NotificationTargetsRepository;
import com.clubHouse.notification_service2.repository.UserSeenNotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
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
    private final NotificationTargetsRepository nTRepository;
    private final NotificationMapper notificationMapper;
    private final ClubServiceClient clubServiceClient;
    private final IndependentServiceClient indServiceClient;
    private final EventServiceClient eventServiceClient;
    private final ProfileManagementServiceClient pmServiceClient;
    private final UserSeenNotificationRepository userSeenNotificationRepository;

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void requireAdminOrModerator(String role) {
        if ("USERS".equals(role)) {
            throw new ServiceException("Insufficient permissions to perform this action");
        }
    }

    private List<Notification> filterValid(Collection<Notification> notifications) {
        return notifications.stream()
                .filter(n -> Boolean.TRUE.equals(n.getIsActive()))
                .filter(n -> n.getValidUntil() == null
                        || n.getValidUntil().isAfter(LocalDateTime.now()))
                .sorted(Comparator.comparing(Notification::getCreatedAt).reversed())
                .toList();
    }

    private Map<Long, String> resolveSourceDetails(List<Notification> notifications) {
        return notifications.stream()
                .collect(Collectors.toMap(
                        Notification::getNotificationId,
                        n -> {
                            try {
                                return switch (n.getSourceType()) {
                                    case CLUB -> {
                                        ClubResponse club = clubServiceClient.getClubById(n.getSourceId());
                                        yield club != null ? club.getClubName() : "Unknown Club";
                                    }
                                    case DEPARTMENT -> {
                                        DepartmentResponse dept = indServiceClient.getDepartmentById(n.getSourceId());
                                        yield dept != null ? dept.getName() : "Unknown Department";
                                    }
                                    case EVENT -> {
                                        EventResponse event = eventServiceClient.getEventById(n.getSourceId());
                                        yield event != null ? event.getTitle() : "Unknown Event";
                                    }
                                    case SYSTEM -> "System";
                                };
                            } catch (Exception e) {
                                log.warn("Could not resolve source for notificationId={}, sourceType={}, sourceId={}",
                                        n.getNotificationId(), n.getSourceType(), n.getSourceId(), e);
                                return null;
                            }
                        },
                        (existing, duplicate) -> existing
                ));
    }

    private Map<Long, List<NotificationTargets>> resolveTargets(List<Notification> notifications) {
        List<Long> ids = notifications.stream().map(Notification::getNotificationId).toList();
        List<NotificationTargets> targets = nTRepository.findByNotification_NotificationIdIn(ids);
        return targets.stream()
                .collect(Collectors.groupingBy(nt -> nt.getNotification().getNotificationId()));
    }

    /**
     * Attaches isRead flag from the seen-map to each response.
     */
    private void attachSeenStatus(List<NotificationResponse> responses, String prn) {
        List<Long> ids = responses.stream().map(NotificationResponse::getNotificationId).toList();
        List<UserSeenNotification> seenList =
                userSeenNotificationRepository.findByPrnAndNotificationIdIn(prn, ids);
        Map<Long, Boolean> seenMap = seenList.stream()
                .collect(Collectors.toMap(
                        UserSeenNotification::getNotificationId,
                        UserSeenNotification::getIsRead
                ));
        responses.forEach(r -> {
            Boolean isRead = seenMap.get(r.getNotificationId());
            r.setIsRead(isRead != null && isRead);
        });
    }

    /**
     * Converts a List<NotificationResponse> into a Page using the provided Pageable.
     */
    private Page<NotificationResponse> toPage(List<NotificationResponse> all, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), all.size());
        List<NotificationResponse> slice = (start >= all.size()) ? List.of() : all.subList(start, end);
        return new PageImpl<>(slice, pageable, all.size());
    }

    // ── Metadata ──────────────────────────────────────────────────────────────

    public List<String> fetchNotificationTargets() {
        return Arrays.stream(NotificationType.values()).map(Enum::name).toList();
    }

    public List<String> fetchSourceTypes() {
        return Arrays.stream(SourceType.values()).map(Enum::name).toList();
    }

    public List<String> fetchTargetTypes() {
        return Arrays.stream(TargetType.values()).map(Enum::name).toList();
    }

    // ── Create ────────────────────────────────────────────────────────────────

    @Transactional
    public NotificationResponse createNotification(NotificationRequest req, String prn, String role) {
        log.info("Creating notification by prn={}, role={}", prn, role);
        requireAdminOrModerator(role);

        Notification notification = Notification.builder()
                .notificationType(req.getNotificationType())
                .title(req.getNotificationTitle())
                .message(req.getMessage())
                .sourceType(req.getSourceType())
                .sourceId(req.getSourceId())
                .targetType(req.getTargetType())
                .createdByPrn(prn)
                .isActive(true)
                .validUntil(req.getValidUntil())
                .build();

        Notification saved = notificationRepository.save(notification);

        if ((req.getTargetType() == TargetType.CLUB || req.getTargetType() == TargetType.DEPARTMENT)
                && req.getTargetedIds() != null && !req.getTargetedIds().isEmpty()) {
            List<NotificationTargets> nTargets = req.getTargetedIds().stream()
                    .map(id -> NotificationTargets.builder()
                            .notification(saved)
                            .targetType(req.getTargetType())
                            .targetId(id)
                            .build())
                    .toList();
            nTRepository.saveAll(nTargets);
        }

        String sourceDetail = resolveSourceDetails(List.of(saved))
                .get(saved.getNotificationId());

        return notificationMapper.toResponse(
                saved,
                req.getTargetType() != null ? req.getTargetType().toString() : null,
                req.getTargetedIds(),
                sourceDetail
        );
    }

    // ── Get All ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<NotificationResponse> getAll(boolean active) {
        log.info("Fetching all {} notifications", active ? "active" : "inactive");
        List<Notification> notifications = active
                ? notificationRepository.findByIsActiveTrueOrderByCreatedAtDesc()
                : notificationRepository.findByIsActiveFalseOrderByCreatedAtDesc();
        if (notifications.isEmpty()) return List.of();
        return notificationMapper.toResponseList(
                notifications, resolveTargets(notifications), resolveSourceDetails(notifications));
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getAllPaged(boolean active, Pageable pageable) {
        log.info("Fetching paginated {} notifications", active ? "active" : "inactive");
        Page<Notification> page = active
                ? notificationRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable)
                : notificationRepository.findByIsActiveFalseOrderByCreatedAtDesc(pageable);
        if (page.isEmpty()) return Page.empty(pageable);

        List<Notification> content = page.getContent();
        List<NotificationResponse> responses = notificationMapper.toResponseList(
                content, resolveTargets(content), resolveSourceDetails(content));
        return new PageImpl<>(responses, pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public ReadUnreadNotificationResponse getAllReadUnread(String prn) {
        log.info("Fetching read & unread notifications for admin prn={}", prn);

        List<Notification> allNotifications = notificationRepository.findAllByOrderByCreatedAtDesc();
        if (allNotifications.isEmpty()) {
            return ReadUnreadNotificationResponse.builder()
                    .read(List.of())
                    .unread(List.of())
                    .build();
        }

        // Get the IDs the user has already read
        Set<Long> readIdSet = userSeenNotificationRepository.getByPrn(prn)
                .stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsRead()))
                .map(UserSeenNotification::getNotificationId)
                .collect(Collectors.toSet());

        // Split notifications into read / unread lists
        List<Notification> readNotifications = allNotifications.stream()
                .filter(n -> readIdSet.contains(n.getNotificationId()))
                .toList();

        List<Notification> unreadNotifications = allNotifications.stream()
                .filter(n -> !readIdSet.contains(n.getNotificationId()))
                .toList();

        // Resolve targets + source details for both lists combined (single DB round-trip each)
        List<Notification> combined = new ArrayList<>(allNotifications);
        Map<Long, List<NotificationTargets>> targetsMap = resolveTargets(combined);
        Map<Long, String> sourceMap = resolveSourceDetails(combined);

        List<NotificationResponse> readResponses = notificationMapper.toResponseList(
                readNotifications, targetsMap, sourceMap);
        readResponses.forEach(r -> r.setIsRead(true));

        List<NotificationResponse> unreadResponses = notificationMapper.toResponseList(
                unreadNotifications, targetsMap, sourceMap);
        unreadResponses.forEach(r -> r.setIsRead(false));

        return ReadUnreadNotificationResponse.builder()
                .read(readResponses)
                .unread(unreadResponses)
                .build();
    }

    @Transactional(readOnly = true)
    public ReadUnreadNotificationPagedResponse getAllReadUnreadPaged(String prn, Pageable pageable) {
        log.info("Fetching paginated read/unread notifications for admin prn={}", prn);

        // Re-use the unpaged method to get the full split, then slice both lists
        ReadUnreadNotificationResponse all = getAllReadUnread(prn);

        Page<NotificationResponse> readPage = toPage(all.getRead(), pageable);
        Page<NotificationResponse> unreadPage = toPage(all.getUnread(), pageable);

        return ReadUnreadNotificationPagedResponse.builder()
                .read(readPage)
                .unread(unreadPage)
                .build();
    }

    // ── My Notifications ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(String prn) {
        log.debug("Fetching notifications for prn={}", prn);

        List<GeneralClubResponse> clubResp = clubServiceClient.getMyClubs();
        RawResponseForNotification profileData = pmServiceClient.getDepartmentIdFromPrn(prn);
        Map<EventResponse, String> eventResp = eventServiceClient.getMyEnrolledEvents();

        List<Long> clubIds = (clubResp != null && !clubResp.isEmpty())
                ? clubResp.stream().map(GeneralClubResponse::getClubId).toList()
                : List.of(-1L); // dummy value so JPQL IN clause never gets an empty list

        Long deptId = profileData != null ? profileData.getDeptId() : null;
        Integer year = profileData != null ? profileData.getYear() : null;

        List<Long> eventIds = eventResp != null
                ? eventResp.keySet().stream().map(EventResponse::getEventId).toList()
                : List.of();

        // 1. GLOBAL + DEPT + CLUB + YEAR notifications (single query)
        List<Notification> targeted = nTRepository.findTargetedNotifications(deptId, clubIds, year);

        // 2. Notifications sourced from events the user is enrolled in
        List<Notification> eventBased = eventIds.isEmpty()
                ? List.of()
                : notificationRepository.findEventNotifications(eventIds);

        // 3. Merge and deduplicate
        Set<Notification> merged = new HashSet<>();
        merged.addAll(targeted);
        merged.addAll(eventBased);

        List<Notification> valid = filterValid(merged);
        if (valid.isEmpty()) return List.of();

        List<NotificationResponse> responses = notificationMapper.toResponseList(
                valid, resolveTargets(valid), resolveSourceDetails(valid));
        attachSeenStatus(responses, prn);
        return responses;
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyNotificationsPaged(String prn, Pageable pageable) {
        List<NotificationResponse> all = getMyNotifications(prn);
        return toPage(all, pageable);
    }

    // ── Filter by Type ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<NotificationResponse> getBySourceType(SourceType sourceType) {
        log.debug("Fetching notifications for sourceType={}", sourceType);
        List<Notification> notifications = notificationRepository.findBySourceType(sourceType);
        if (notifications.isEmpty()) return List.of();
        return notificationMapper.toResponseList(
                notifications, resolveTargets(notifications), resolveSourceDetails(notifications));
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getBySourceTypePaged(SourceType sourceType, Pageable pageable) {
        Page<Notification> page = notificationRepository.findBySourceType(sourceType, pageable);
        if (page.isEmpty()) return Page.empty(pageable);
        List<Notification> content = page.getContent();
        List<NotificationResponse> responses = notificationMapper.toResponseList(
                content, resolveTargets(content), resolveSourceDetails(content));
        return new PageImpl<>(responses, pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getByNotificationType(NotificationType nType) {
        log.debug("Fetching notifications for notificationType={}", nType);
        List<Notification> notifications = notificationRepository.findByNotificationType(nType);
        if (notifications.isEmpty()) return List.of();
        return notificationMapper.toResponseList(
                notifications, resolveTargets(notifications), resolveSourceDetails(notifications));
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getByNotificationTypePaged(NotificationType nType, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByNotificationType(nType, pageable);
        if (page.isEmpty()) return Page.empty(pageable);
        List<Notification> content = page.getContent();
        List<NotificationResponse> responses = notificationMapper.toResponseList(
                content, resolveTargets(content), resolveSourceDetails(content));
        return new PageImpl<>(responses, pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getByTargetType(TargetType targetType) {
        log.debug("Fetching notifications for targetType={}", targetType);
        List<NotificationTargets> targets = nTRepository.findByTargetType(targetType);
        List<Notification> notifications = targets.stream()
                .map(NotificationTargets::getNotification).toList();
        if (notifications.isEmpty()) return List.of();
        return notificationMapper.toResponseList(
                notifications, resolveTargets(notifications), resolveSourceDetails(notifications));
    }

    // ── Mark as Read ──────────────────────────────────────────────────────────

    @Transactional
    public void markAsRead(Long notificationId, String prn) {
        log.debug("Marking notificationId={} as read for prn={}", notificationId, prn);
        if (!notificationRepository.existsById(notificationId)) {
            throw new ServiceException("Notification not found: " + notificationId);
        }
        UserSeenNotification seen = userSeenNotificationRepository
                .findByPrnAndNotificationId(prn, notificationId)
                .orElse(UserSeenNotification.builder()
                        .prn(prn)
                        .notificationId(notificationId)
                        .build());
        seen.setIsRead(true);
        userSeenNotificationRepository.save(seen);
    }

    @Transactional
    public void markAllAsRead(String prn) {
        log.debug("Marking all notifications as read for prn={}", prn);
        List<NotificationResponse> myNotifications = getMyNotifications(prn);
        List<Long> ids = myNotifications.stream()
                .map(NotificationResponse::getNotificationId)
                .toList();
        if (ids.isEmpty()) return;

        // Fetch existing records
        List<UserSeenNotification> existing =
                userSeenNotificationRepository.findByPrnAndNotificationIdIn(prn, ids);
        Map<Long, UserSeenNotification> existingMap = existing.stream()
                .collect(Collectors.toMap(UserSeenNotification::getNotificationId, s -> s));

        // Build upsert list
        List<UserSeenNotification> toSave = ids.stream()
                .map(id -> {
                    UserSeenNotification seen = existingMap.getOrDefault(id,
                            UserSeenNotification.builder().prn(prn).notificationId(id).build());
                    seen.setIsRead(true);
                    return seen;
                })
                .toList();

        userSeenNotificationRepository.saveAll(toSave);
        log.info("Marked {} notifications as read for prn={}", toSave.size(), prn);
    }

    // ── Get by ID ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public NotificationResponse getById(Long notificationId) {
        log.debug("Fetching notificationId={}", notificationId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ServiceException("Notification not found: " + notificationId));

        List<Notification> wrapped = List.of(notification);
        Map<Long, List<NotificationTargets>> targetsMap = resolveTargets(wrapped);
        Map<Long, String> sourceDetailMap = resolveSourceDetails(wrapped);

        List<NotificationTargets> targets =
                targetsMap.getOrDefault(notificationId, List.of());

        String targetType = targets.isEmpty() ? null : targets.get(0).getTargetType().toString();
        List<Long> targetIds = targets.stream().map(NotificationTargets::getTargetId).toList();

        return notificationMapper.toResponse(
                notification, targetType, targetIds, sourceDetailMap.get(notificationId));
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getCreatedByMe(String prn) {
        log.info("Fetching notifications created by prn={}", prn);

        List<Notification> notifications =
                notificationRepository.findByCreatedByPrnOrderByCreatedAtDesc(prn);

        if (notifications.isEmpty()) return List.of();

        return notificationMapper.toResponseList(
                notifications,
                resolveTargets(notifications),
                resolveSourceDetails(notifications)
        );
    }

    /**
     * Paged variant of getCreatedByMe.
     * Uses a true DB-level page query so only the requested slice is loaded.
     */
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getCreatedByMePaged(String prn, Pageable pageable) {
        log.info("Fetching paginated notifications created by prn={}", prn);

        Page<Notification> page =
                notificationRepository.findByCreatedByPrnOrderByCreatedAtDesc(prn, pageable);

        if (page.isEmpty()) return Page.empty(pageable);

        List<Notification> content = page.getContent();
        List<NotificationResponse> responses = notificationMapper.toResponseList(
                content,
                resolveTargets(content),
                resolveSourceDetails(content)
        );

        // Preserve the total element count from the DB page so the caller gets
        // correct pagination metadata (totalPages, totalElements, etc.)
        return new PageImpl<>(responses, pageable, page.getTotalElements());
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Transactional
    public NotificationResponse update(Long notificationId, NotificationUpdateRequest req, String role) {
        log.info("Updating notificationId={} by role={}", notificationId, role);
        requireAdminOrModerator(role);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ServiceException("Notification not found: " + notificationId));

        // Only apply fields that were actually sent (non-null)
        if (req.getNotificationTitle() != null && !req.getNotificationTitle().isBlank()) {
            notification.setTitle(req.getNotificationTitle());
        }
        if (req.getMessage() != null && !req.getMessage().isBlank()) {
            notification.setMessage(req.getMessage());
        }
        if (req.getNotificationType() != null) {
            notification.setNotificationType(req.getNotificationType());
        }
        if (req.getValidUntil() != null) {
            if (req.getValidUntil().isBefore(LocalDateTime.now())) {
                throw new ServiceException("validUntil must be a future date");
            }
            notification.setValidUntil(req.getValidUntil());
        }

        Notification saved = notificationRepository.save(notification);
        return getById(saved.getNotificationId());
    }

    // ── My Unread ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyUnreadNotifications(String prn) {
        log.debug("Fetching unread notifications for prn={}", prn);

        List<NotificationResponse> all = getMyNotifications(prn);

        // isRead is populated by attachSeenStatus inside getMyNotifications.
        // A notification is "unread" if isRead is null (never seen) or explicitly false.
        return all.stream()
                .filter(n -> !Boolean.TRUE.equals(n.getIsRead()))
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyUnreadNotificationsPaged(String prn, Pageable pageable) {
        List<NotificationResponse> unread = getMyUnreadNotifications(prn);
        return toPage(unread, pageable);
    }

    // ── Unread Count ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public long getUnreadCount(String prn) {
        log.debug("Counting unread notifications for prn={}", prn);
        // Count notifications the user can see that have NO seen record or isRead = false
        List<NotificationResponse> all = getMyNotifications(prn);
        return all.stream()
                .filter(n -> !Boolean.TRUE.equals(n.getIsRead()))
                .count();
    }

    // ── Reactivate ────────────────────────────────────────────────────────────

    @Transactional
    public void reactivate(Long notificationId, String role) {
        log.info("Reactivating notificationId={} by role={}", notificationId, role);
        requireAdminOrModerator(role);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ServiceException("Notification not found: " + notificationId));

        if (Boolean.TRUE.equals(notification.getIsActive())) {
            throw new ServiceException("Notification is already active");
        }

        // If it had a validUntil in the past, warn but still reactivate —
        // the caller should update validUntil via PATCH /{id} separately if needed.
        if (notification.getValidUntil() != null
                && notification.getValidUntil().isBefore(LocalDateTime.now())) {
            log.warn("Reactivating notificationId={} but validUntil={} is in the past — " +
                            "it will be filtered from user feeds until validUntil is updated",
                    notificationId, notification.getValidUntil());
        }

        notification.setIsActive(true);
        notificationRepository.save(notification);
    }

    // ── Deactivate / Delete ───────────────────────────────────────────────────

    @Transactional
    public void deactivate(Long notificationId, String role) {
        log.info("Deactivating notificationId={} by role={}", notificationId, role);
        requireAdminOrModerator(role);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ServiceException("Notification not found: " + notificationId));
        notification.setIsActive(false);
        notificationRepository.save(notification);
    }

    @Transactional
    public void delete(Long notificationId, String role) {
        log.info("Deleting notificationId={} by role={}", notificationId, role);
        requireAdminOrModerator(role);
        if (!notificationRepository.existsById(notificationId)) {
            throw new ServiceException("Notification not found: " + notificationId);
        }
        nTRepository.deleteByNotification_NotificationId(notificationId);
        userSeenNotificationRepository.deleteByNotificationId(notificationId);
        notificationRepository.deleteById(notificationId);
    }

    @Transactional
    public NotificationResponse triggerNotification(Long notificationId, String prn, String role) {

        log.info("Attempting to create trigger");

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notification", notificationId.toString()));

        if (!role.equals("SUPER_ADMIN") && !prn.equals(notification.getCreatedByPrn())) {
            throw new ServiceException("You are not authorized to change the notification");
        }

        List<NotificationTargets> targets = nTRepository.findByNotification(notification);

        Notification newReminder = Notification.builder()
                .notificationType(NotificationType.REMINDER)
                .title(notification.getTitle())
                .message(notification.getMessage())
                .sourceType(notification.getSourceType())
                .sourceId(notification.getSourceId())
                .createdByPrn(prn)
                .targetType(notification.getTargetType())
                .isActive(true)
                .triggerAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .validUntil(notification.getValidUntil())
                .build();

        Notification saved = notificationRepository.save(newReminder);

        // copy targets
        List<NotificationTargets> newTargets = targets.stream()
                .map(t -> NotificationTargets.builder()
                        .notification(saved)
                        .targetType(t.getTargetType())
                        .targetId(t.getTargetId())
                        .build())
                .toList();

        nTRepository.saveAll(newTargets);

        List<Long> targetIds = newTargets.stream()
                .map(NotificationTargets::getTargetId)
                .toList();

        Map<Long, String> sourceDetailMap = resolveSourceDetails(List.of(saved));

        return notificationMapper.toResponse(
                saved,
                NotificationType.REMINDER.name(),
                targetIds,
                sourceDetailMap.get(saved.getNotificationId())
        );
    }
}