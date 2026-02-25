package com.clubHouse.notification_service2.service;

import com.clubHouse.notification_service2.client.ClubServiceClient;
import com.clubHouse.notification_service2.client.EventServiceClient;
import com.clubHouse.notification_service2.client.IndependentServiceClient;
import com.clubHouse.notification_service2.dto.request.NotificationRequest;
import com.clubHouse.notification_service2.dto.response.ClubResponse;
import com.clubHouse.notification_service2.dto.response.DepartmentResponse;
import com.clubHouse.notification_service2.dto.response.EventResponse;
import com.clubHouse.notification_service2.dto.response.NotificationResponse;
import com.clubHouse.notification_service2.exception.ServiceException;
import com.clubHouse.notification_service2.mapper.NotificationMapper;
import com.clubHouse.notification_service2.model.*;
import com.clubHouse.notification_service2.repository.NotificationRepository;
import com.clubHouse.notification_service2.repository.NotificationTargetsRepository;
import com.netflix.discovery.provider.Serializer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

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

        if(saved.getSourceType() == SourceType.CLUB){
            ClubResponse club =clubServiceClient.getClubById(saved.getSourceId());
            sourceDetail = club.getClubName();
        }else if(saved.getSourceType() == SourceType.DEPARTMENT){
            DepartmentResponse dept = indServiceClient.getDepartmentById(saved.getSourceId());
            sourceDetail = dept.getName();
        }else if(saved.getSourceType() == SourceType.EVENT){
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

    @Transactional
    public List<NotificationResponse> getAll(boolean flag) {

        log.info("Attempting to fetch all notifications");

        if(flag){
            List<Notification> notifications = notificationRepository.findByIsActiveTrue();
        }else{
            List<Notification> notifications = notificationRepository.findByIsActiveFalse();
        }

//        Map<Notification, List<Long>>

        return null;

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
}
