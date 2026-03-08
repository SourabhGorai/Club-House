package com.clubHouse.notification_service2.dto.response;

import com.clubHouse.notification_service2.model.SourceType;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventNotificationResponse implements Serializable {

    private Long notificationId;

    // If event notification type is event
    private String eventTitle;

    private String eventId;

    private String title;

    private String message;

    private String notificationType;

    private SourceType sourceType;

    private Long sourceId;

    private String createdByPrn;

    private Boolean isActive;

    private String createdAt;

    private String validUntil;

    private String targetType;

    private List<Long> targetIds;

}
