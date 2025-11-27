package com.notificationservice.notification_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.notificationservice.notification_service.model.NotificationPriority;
import com.notificationservice.notification_service.model.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Request DTO for creating notifications
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationCreateRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    @NotBlank(message = "Message is required")
    @Size(max = 2000, message = "Message cannot exceed 2000 characters")
    private String message;

    @NotNull(message = "Notification type is required")
    private NotificationType notificationType;

    @NotBlank(message = "Sender PRN is required")
    private String senderPrn;

    // For PERSONAL notifications
    private String recipientPrn;

    // For CLUB_SPECIFIC notifications
    private List<String> targetClubs;

    // For DEPARTMENT notifications
    private List<String> targetDepartments;

    // For YEAR_SPECIFIC notifications
    private List<Integer> targetYears;

    private NotificationPriority priority;

    private String actionUrl;

    private String category;

    private LocalDateTime expiryDate;

    private LocalDateTime scheduledFor;
}