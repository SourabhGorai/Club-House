package com.notificationservice.notification_service.dto;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.notificationservice.notification_service.model.NotificationPriority;
import com.notificationservice.notification_service.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationSummary {

    private String id;
    private String title;
    private String message;
    private NotificationType notificationType;
    private String senderName;
    private NotificationPriority priority;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private String category;
}