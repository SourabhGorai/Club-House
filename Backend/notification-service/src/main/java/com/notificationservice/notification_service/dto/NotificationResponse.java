package com.notificationservice.notification_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.notificationservice.notification_service.model.NotificationPriority;
import com.notificationservice.notification_service.model.NotificationStatus;
import com.notificationservice.notification_service.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationResponse {

    private String id;
    private String title;
    private String message;
    private NotificationType notificationType;

    private String senderPrn;
    private String senderName;

    private String recipientPrn;
    private String recipientName;

    private List<String> targetClubs;
    private List<String> targetDepartments;
    private List<Integer> targetYears;

    private NotificationPriority priority;
    private NotificationStatus status;

    // Read status - now dynamically determined per user
    private Boolean isRead;
    private LocalDateTime readAt;

    private String actionUrl;
    private String category;
    private LocalDateTime expiryDate;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long viewCount;
    private Boolean isScheduled;
    private LocalDateTime scheduledFor;

    // Analytics data (optional)
    private Long totalReaders; // How many users have read this (for broadcast notifications)
}