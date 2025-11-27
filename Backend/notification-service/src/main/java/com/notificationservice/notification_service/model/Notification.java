package com.notificationservice.notification_service.model;

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
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "notifications")
@CompoundIndexes({
        @CompoundIndex(name = "type_created_idx", def = "{'notificationType': 1, 'createdAt': -1}"),
        @CompoundIndex(name = "club_created_idx", def = "{'targetClubs': 1, 'createdAt': -1}"),
        @CompoundIndex(name = "dept_created_idx", def = "{'targetDepartments': 1, 'createdAt': -1}"),
        @CompoundIndex(name = "status_created_idx", def = "{'status': 1, 'createdAt': -1}")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    private String id;

    @Field("title")
    @Indexed
    private String title;

    @Field("message")
    private String message;

    @Field("notificationType")
    @Indexed
    private NotificationType notificationType;

    // Sender Information
    @Field("senderPrn")
    @Indexed
    private String senderPrn;

    @Field("senderName")
    private String senderName;

    // Recipient Information (ONLY for personal notifications)
    @Field("recipientPrn")
    @Indexed
    private String recipientPrn;

    @Field("recipientName")
    private String recipientName;

    // For club-specific or department-specific notifications
    @Field("targetClubs")
    private List<String> targetClubs;

    @Field("targetDepartments")
    private List<String> targetDepartments;

    @Field("targetYears")
    private List<Integer> targetYears;

    // Priority and Status
    @Field("priority")
    @Builder.Default
    @Indexed
    private NotificationPriority priority = NotificationPriority.NORMAL;

    @Field("status")
    @Builder.Default
    @Indexed
    private NotificationStatus status = NotificationStatus.ACTIVE;

    // Additional metadata
    @Field("actionUrl")
    private String actionUrl;

    @Field("category")
    private String category;

    @Field("isDeleted")
    @Builder.Default
    private Boolean isDeleted = false;

    @Field("expiryDate")
    @Indexed
    private LocalDateTime expiryDate;

    // Timestamps
    @Field("createdAt")
    @CreatedDate
    @Indexed
    private LocalDateTime createdAt;

    @Field("updatedAt")
    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Field("deletedAt")
    private LocalDateTime deletedAt;

    // Statistics (for analytics)
    @Field("viewCount")
    @Builder.Default
    private Long viewCount = 0L;

    // For scheduled notifications
    @Field("scheduledFor")
    private LocalDateTime scheduledFor;

    @Field("isScheduled")
    @Builder.Default
    private Boolean isScheduled = false;
}