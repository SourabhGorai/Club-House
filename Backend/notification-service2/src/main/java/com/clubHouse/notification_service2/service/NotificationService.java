package com.clubHouse.notification_service2.service;

import com.clubHouse.notification_service2.client.ClubServiceClient;
import com.clubHouse.notification_service2.client.EventServiceClient;
import com.clubHouse.notification_service2.client.IndependentServiceClient;
import com.clubHouse.notification_service2.client.ProfileManagementServiceClient;
import com.clubHouse.notification_service2.dto.request.NotificationRequest;
import com.clubHouse.notification_service2.dto.response.*;
import com.clubHouse.notification_service2.exception.ServiceException;
import com.clubHouse.notification_service2.mapper.NotificationMapper;
import com.clubHouse.notification_service2.model.*;
import com.clubHouse.notification_service2.repository.NotificationRepository;
import com.clubHouse.notification_service2.repository.NotificationTargetsRepository;
import com.clubHouse.notification_service2.repository.UserSeenNotificationRepository;
import com.netflix.discovery.provider.Serializer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    // ── Private helper: resolves source name for each notification ───────────────

    private Map<Long, String> resolveSourceDetails(List<Notification> notifications) {
        return notifications.stream()
                .collect(Collectors.toMap(
                        Notification::getNotificationId,
                        notification -> {
                            try {
                                return switch (notification.getSourceType()) {
                                    case CLUB -> {
                                        ClubResponse club =
                                                clubServiceClient.getClubById(notification.getSourceId());
                                        yield club.getClubName();
                                    }
                                    case DEPARTMENT -> {
                                        DepartmentResponse dept =
                                                indServiceClient.getDepartmentById(notification.getSourceId());
                                        yield dept.getName();
                                    }
                                    case EVENT -> {
                                        EventResponse event =
                                                eventServiceClient.getEventById(notification.getSourceId());
                                        yield event.getTitle();
                                    }
                                    case SYSTEM -> "System";
                                };
                            } catch (Exception e) {
                                log.warn("Could not resolve source detail for notificationId={}, sourceType={}, sourceId={}",
                                        notification.getNotificationId(),
                                        notification.getSourceType(),
                                        notification.getSourceId(), e);
                                return null;
                            }
                        },
                        (existing, duplicate) -> existing   // safe merge in case of duplicates
                ));
    }

    // ── Private helper: builds notificationId -> targets map ────────────────────

    private Map<Long, List<NotificationTargets>> resolveTargets(List<Notification> notifications) {
        List<Long> ids = notifications.stream()
                .map(Notification::getNotificationId)
                .toList();

        List<NotificationTargets> targets = nTRepository.findByNotification_NotificationIdIn(ids);

        return targets.stream()
                .collect(Collectors.groupingBy(
                        (NotificationTargets nt) -> nt.getNotification().getNotificationId()
                ));
    }


    public List<String> fetchNotificationTargets() {

        log.info("Attempting to fetch all Notification Targets");

        return List.of(Arrays.toString(NotificationType.values()));

    }

    public List<String> fetchSourceTypes() {

        log.info("Attempting to fetch all Source Types");

        return List.of(Arrays.toString(SourceType.values()));

    }

    public List<String> fetchTargetTypes() {

        log.info("Attempting to fetch all Target Types");

        return List.of(Arrays.toString(TargetType.values()));

    }

    // ──────────────────────────────────────────────────────────────────────────────────────

    @Transactional
    public NotificationResponse createNotification(
            NotificationRequest req,
            String prn,
            String role
    ) {

        log.info("Attempting to create a new notification");

        if ("USERS".equals(role)) {
            log.warn("Users can't create notification");
            throw new ServiceException("User can't create notification");
        }

        Notification notification = Notification.builder()
                .notificationType(req.getNotificationType())
                .title(req.getNotificationTitle())
                .message(req.getMessage())
                .sourceType(req.getSourceType())
                .sourceId(req.getSourceId())
                .createdByPrn(prn)
                .isActive(true)
                .validUntil(req.getValidUntil())
                .build();

        Notification saved = notificationRepository.save(notification);

        if ((req.getTargetType() == TargetType.CLUB
                || req.getTargetType() == TargetType.DEPARTMENT)
                && req.getTargetedIds() != null
                && !req.getTargetedIds().isEmpty()) {

            List<NotificationTargets> nTargets = req.getTargetedIds()
                    .stream()
                    .map(id -> NotificationTargets.builder()
                            .notification(saved)
                            .targetType(req.getTargetType())
                            .targetId(id)
                            .build())
                    .toList();

            nTRepository.saveAll(nTargets);
        }

        String sourceDetail = null;

        if (saved.getSourceType() == SourceType.CLUB) {
            ClubResponse club = clubServiceClient.getClubById(saved.getSourceId());
            sourceDetail = club.getClubName();
        } else if (saved.getSourceType() == SourceType.DEPARTMENT) {
            DepartmentResponse dept = indServiceClient.getDepartmentById(saved.getSourceId());
            sourceDetail = dept.getName();
        } else if (saved.getSourceType() == SourceType.EVENT) {
            EventResponse event = eventServiceClient.getEventById(saved.getSourceId());
            sourceDetail = event.getTitle();
        }

        return notificationMapper.toResponse(
                saved,
                req.getTargetType().toString(),
                req.getTargetedIds(),
                sourceDetail
        );
    }

    // ──────────────────────────────────────────────────────────────────────────────────────

    @Transactional
    public List<NotificationResponse> getAll(boolean flag) {

        log.info("Fetching all {} notifications", flag ? "active" : "inactive");

        List<Notification> notifications = flag
                ? notificationRepository.findByIsActiveTrue()
                : notificationRepository.findByIsActiveFalse();

        if (notifications.isEmpty()) return List.of();

        Map<Long, List<NotificationTargets>> targetsMap = resolveTargets(notifications);
        Map<Long, String> sourceDetailMap = resolveSourceDetails(notifications);

        return notificationMapper.toResponseList(notifications, targetsMap, sourceDetailMap);
    }

    // ──────────────────────────────────────────────────────────────────────────────────────

    public List<NotificationResponse> getBySourceType(SourceType sourceType) {

        log.debug("Attempting to fetch all notifications for source type: {}", sourceType);

        List<Notification> notifications = notificationRepository.findBySourceType(sourceType);

        if (notifications.isEmpty()) return List.of();

        Map<Long, List<NotificationTargets>> targetsMap = resolveTargets(notifications);
        Map<Long, String> sourceDetailMap = resolveSourceDetails(notifications);

        return notificationMapper.toResponseList(notifications, targetsMap, sourceDetailMap);
    }

    // ──────────────────────────────────────────────────────────────────────────────────────

    public List<NotificationResponse> getByNotificationType(NotificationType nType) {

        log.debug("Attempting to fetch notifications with type: {}", nType);

        List<Notification> notifications = notificationRepository.findByNotificationType(nType);

        Map<Long,List<NotificationTargets>> targetsMap = resolveTargets(notifications);
        Map<Long, String> sourceDetailMap = resolveSourceDetails(notifications);

        return notificationMapper.toResponseList(notifications, targetsMap, sourceDetailMap);

    }

    // ──────────────────────────────────────────────────────────────────────────────────────

    public List<NotificationResponse> getByTargetType(TargetType targetType) {

        log.debug("Attempting to fetch notifications with target type: {}", targetType);

        List<NotificationTargets> targets = nTRepository.findByTargetType(targetType);

        List<Notification> responses = targets.stream()
                .map(NotificationTargets::getNotification)
                .toList();

        Map<Long, List<NotificationTargets>> targetMap = resolveTargets(responses);
        Map<Long, String> sourceDetailMap = resolveSourceDetails(responses);

        return notificationMapper.toResponseList(responses, targetMap, sourceDetailMap);
    }

    // ──────────────────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(String prn) {

        log.debug("Fetching notifications for prn: {}", prn);

        List<GeneralClubResponse> clubResp = clubServiceClient.getMyClubs();
        RawResponseForNotification departResp = pmServiceClient.getDepartmentIdFromPrn(prn);
        Map<EventResponse, String> eventResp = eventServiceClient.getMyEnrolledEvents();

        List<Long> clubIds = clubResp.stream()
                .map(GeneralClubResponse::getClubId)
                .toList();

        Long deptId = departResp.getDeptId();

        List<Long> eventIds = eventResp.keySet()
                .stream()
                .map(EventResponse::getEventId)
                .toList();

        // 1️⃣ Target based notifications (GLOBAL / DEPT / CLUB)
        List<Notification> targetedNotifications =
                nTRepository.findTargetedNotifications(deptId, clubIds);

        // 2️⃣ Event based notifications (sourceType = EVENT)
        List<Notification> eventNotifications = eventIds.isEmpty()
                ? List.of()
                : notificationRepository.findEventNotifications(eventIds);

        // 3️⃣ Merge + remove duplicates
        Set<Notification> merged = new HashSet<>();
        merged.addAll(targetedNotifications);
        merged.addAll(eventNotifications);

        if (merged.isEmpty()) return List.of();

        // 4️⃣ Filter active + valid
        List<Notification> validNotifications = merged.stream()
                .filter(n -> Boolean.TRUE.equals(n.getIsActive()))
                .filter(n -> n.getValidUntil() == null
                        || n.getValidUntil().isAfter(java.time.LocalDateTime.now()))
                .sorted(Comparator.comparing(Notification::getCreatedAt).reversed())
                .toList();

        if (validNotifications.isEmpty()) return List.of();

        // 5️⃣ Resolve targets & source details (like your other methods)
        Map<Long, List<NotificationTargets>> targetsMap =
                resolveTargets(validNotifications);

        Map<Long, String> sourceDetailMap =
                resolveSourceDetails(validNotifications);

        // 6️⃣ Fetch seen notifications
        List<Long> ids = validNotifications.stream()
                .map(Notification::getNotificationId)
                .toList();

        List<UserSeenNotification> seenList =
                userSeenNotificationRepository
                        .findByPrnAndNotificationIdIn(prn, ids);

        Map<Long, Boolean> seenMap = seenList.stream()
                .collect(Collectors.toMap(
                        UserSeenNotification::getNotificationId,
                        UserSeenNotification::getIsRead
                ));

        // 7️⃣ Build final response using existing mapper
        List<NotificationResponse> responses =
                notificationMapper.toResponseList(validNotifications, targetsMap, sourceDetailMap);

        // 8️⃣ Attach read/unread flag
        responses.forEach(res -> {
            Boolean isRead = seenMap.get(res.getNotificationId());
            res.setIsRead(isRead != null && isRead);
        });

        return responses;
    }

    // ──────────────────────────────────────────────────────────────────────────────────────


}
