package com.notificationservice.notification_service.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "notifications")
@CompoundIndexes({
        @CompoundIndex(name = "recipient_read_idx", def = "{'recipientPrn': 1, 'isRead': 1}"),
        @CompoundIndex(name = "type_created_idx", def = "{'notificationType': 1, 'createdAt': -1}"),
        @CompoundIndex(name = "club_created_idx", def = "{'targetClubs': 1, 'createdAt': -1}")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    private String id;

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    @Indexed
    private String title;

    @NotBlank(message = "Message is required")
    @Size(max = 2000, message = "Message cannot exceed 2000 characters")
    private String message;

    @NotNull(message = "Notification type is required")
    @Indexed
    private NotificationType notificationType;

    // Sender Information
    @NotBlank(message = "Sender PRN is required")
    @Indexed
    private String senderPrn;

    @NotBlank(message = "Sender name is required")
    private String senderName;

    // Recipient Information (for personal notifications)
    @Indexed
    private String recipientPrn;

    private String recipientName;

    // For club-specific or department-specific notifications
    private List<String> targetClubs;  // List of club names

    private List<String> targetDepartments;  // IT, CSE, MECH, etc.

    private List<Integer> targetYears;  // 1, 2, 3, 4

    // Priority and Status
    @Builder.Default
    @Indexed
    private NotificationPriority priority = NotificationPriority.NORMAL;

    @Builder.Default
    @Indexed
    private NotificationStatus status = NotificationStatus.ACTIVE;

    @Builder.Default
    @Indexed
    private Boolean isRead = false;

    private LocalDateTime readAt;

    // Additional metadata
    private String actionUrl;  // Optional URL for action button

    private String category;  // Event, Announcement, Reminder, etc.

    @Builder.Default
    private Boolean isDeleted = false;

    @Indexed
    private LocalDateTime expiryDate;  // Optional expiry for time-sensitive notifications

    // Timestamps
    @CreatedDate
    @Indexed
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

    // Statistics (for analytics)
    @Builder.Default
    private Long viewCount = 0L;

    // For scheduled notifications
    private LocalDateTime scheduledFor;

    @Builder.Default
    private Boolean isScheduled = false;
}