package com.notificationservice.notification_service.dto;
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
public class NotificationFilterRequest {

    private NotificationType notificationType;
    private NotificationPriority priority;
    private NotificationStatus status;
    private Boolean isRead;
    private String category;
    private String senderPrn;
    private String recipientPrn;
    private List<String> targetClubs;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @Builder.Default
    private Integer page = 0;

    @Builder.Default
    private Integer size = 20;

    @Builder.Default
    private String sortBy = "createdAt";

    @Builder.Default
    private String sortDirection = "DESC";
}