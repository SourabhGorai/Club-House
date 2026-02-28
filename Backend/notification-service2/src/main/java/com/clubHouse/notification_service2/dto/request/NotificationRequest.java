package com.clubHouse.notification_service2.dto.request;

import com.clubHouse.notification_service2.model.NotificationType;
import com.clubHouse.notification_service2.model.SourceType;
import com.clubHouse.notification_service2.model.TargetType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationRequest {

    @NotNull
    private SourceType sourceType;

    private Long sourceId;

    @NotNull(message = "Title is required")
    private String notificationTitle;

    @NotNull(message = "Message is required")
    private String message;

    @NotNull(message = "Notification Type is required")
    private NotificationType notificationType;

    @NotNull(message = "Target Type is required")
    private TargetType targetType;

    private List<Long> targetedIds;

    private LocalDateTime validUntil;

}

/*
* {
*   "sourceType": "EVENT",
*   "sourceId": 4,
*   "notificationTitle": "Bhartiyam 2027",
*   "message": "Everyone is invited to bhartiyam 2027",
*   "notificationType": "GLOBAL",
*   "targetType": "GLOBAL"
* }
* */


// if its a event specific notification, then i need to send the
// notification according to the targeted type of that
// notification