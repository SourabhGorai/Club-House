package com.notificationservice.notification_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Tracks which users have read which notifications
 * This is required for broadcast notifications (GLOBAL, CLUB, DEPARTMENT, etc.)
 */
@Document(collection = "notification_read_status")
@CompoundIndexes({
        @CompoundIndex(name = "user_notification_unique_idx",
                def = "{'userPrn': 1, 'notificationId': 1}",
                unique = true),
        @CompoundIndex(name = "notification_read_idx",
                def = "{'notificationId': 1, 'readAt': 1}")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationReadStatus {

    @Id
    private String id;

    @Indexed
    private String notificationId;

    @Indexed
    private String userPrn;

    private LocalDateTime readAt;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}