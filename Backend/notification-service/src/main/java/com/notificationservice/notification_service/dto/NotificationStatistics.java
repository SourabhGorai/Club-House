package com.notificationservice.notification_service.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationStatistics {

    private Long totalNotifications;
    private Long unreadCount;
    private Long readCount;

    private Long activeCount;
    private Long expiredCount;
    private Long archivedCount;

    private Long globalNotifications;
    private Long personalNotifications;
    private Long clubNotifications;
    private Long departmentNotifications;
    private Long yearNotifications;

    private Long urgentCount;
    private Long highPriorityCount;
    private Long normalPriorityCount;
    private Long lowPriorityCount;
}