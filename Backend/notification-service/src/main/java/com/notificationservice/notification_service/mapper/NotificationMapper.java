package com.notificationservice.notification_service.mapper;

import com.notificationservice.notification_service.dto.NotificationCreateRequest;
import com.notificationservice.notification_service.dto.NotificationResponse;
import com.notificationservice.notification_service.dto.NotificationSummary;
import com.notificationservice.notification_service.model.Notification;
import com.notificationservice.notification_service.model.NotificationPriority;
import com.notificationservice.notification_service.model.NotificationReadStatus;
import com.notificationservice.notification_service.model.NotificationStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class NotificationMapper {

    public Notification toEntity(NotificationCreateRequest request) {
        return Notification.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .notificationType(request.getNotificationType())
                .senderPrn(request.getSenderPrn())
                .recipientPrn(request.getRecipientPrn())
                .targetClubs(request.getTargetClubs())
                .targetDepartments(request.getTargetDepartments())
                .targetYears(request.getTargetYears())
                .priority(request.getPriority() != null ? request.getPriority() : NotificationPriority.NORMAL)
                .status(NotificationStatus.ACTIVE)
                .isDeleted(false)
                .actionUrl(request.getActionUrl())
                .category(request.getCategory())
                .expiryDate(request.getExpiryDate())
                .scheduledFor(request.getScheduledFor())
                .isScheduled(request.getScheduledFor() != null &&
                        request.getScheduledFor().isAfter(LocalDateTime.now()))
                .viewCount(0L)
                .build();
    }

    /**
     * Maps notification to response WITHOUT read status
     * Use this when you don't have read status information
     */
    public NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .notificationType(notification.getNotificationType())
                .senderPrn(notification.getSenderPrn())
                .senderName(notification.getSenderName())
                .recipientPrn(notification.getRecipientPrn())
                .recipientName(notification.getRecipientName())
                .targetClubs(notification.getTargetClubs())
                .targetDepartments(notification.getTargetDepartments())
                .targetYears(notification.getTargetYears())
                .priority(notification.getPriority())
                .status(notification.getStatus())
                .isRead(null) // Will be set separately
                .readAt(null)
                .actionUrl(notification.getActionUrl())
                .category(notification.getCategory())
                .expiryDate(notification.getExpiryDate())
                .createdAt(notification.getCreatedAt())
                .updatedAt(notification.getUpdatedAt())
                .viewCount(notification.getViewCount())
                .isScheduled(notification.getIsScheduled())
                .scheduledFor(notification.getScheduledFor())
                .build();
    }

    /**
     * Maps notification to response WITH read status for a specific user
     */
    public NotificationResponse toResponse(Notification notification, NotificationReadStatus readStatus) {
        NotificationResponse response = toResponse(notification);
        if (readStatus != null) {
            response.setIsRead(true);
            response.setReadAt(readStatus.getReadAt());
        } else {
            response.setIsRead(false);
            response.setReadAt(null);
        }
        return response;
    }

    /**
     * Maps notification to response WITH read status boolean
     */
    public NotificationResponse toResponse(Notification notification, boolean isRead, LocalDateTime readAt) {
        NotificationResponse response = toResponse(notification);
        response.setIsRead(isRead);
        response.setReadAt(readAt);
        return response;
    }

    public NotificationSummary toSummary(Notification notification, boolean isRead) {
        return NotificationSummary.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .notificationType(notification.getNotificationType())
                .senderName(notification.getSenderName())
                .priority(notification.getPriority())
                .isRead(isRead)
                .createdAt(notification.getCreatedAt())
                .category(notification.getCategory())
                .build();
    }
}