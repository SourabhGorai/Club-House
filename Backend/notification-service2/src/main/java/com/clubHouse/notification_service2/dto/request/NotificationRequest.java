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
    private TargetType targetType = TargetType.GLOBAL;

    private List<Long> targetedIds;

    private LocalDateTime validUntil;

}

/*
* {
*   "sourceType": "EVENT",
*   "sourceId": eventId,
*   "notificationTitle": "Event Name",
*   "message": "Everyone is invited to join the event <event name> which is going
*    to be held in <venu>, (and the <event description>)",
*   "notificationType": based on event target type,
*   "targetType": "target Type",
*   "targetedIds: ids of the target type/ empty list if target type is global"
*   "validUntil: eventDate time"
* }
* */


// if its a event specific notification, then i need to send the
// notification according to the targeted type of that
// notification