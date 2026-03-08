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
public class NotificationResponse implements Serializable {

    private Long notificationId;

    private String title;
    private String message;

    private String notificationType;

    private String sourceType;
    private Long sourceId;
    private String sourceDetail;

    private String createdByPrn;
    private Boolean isActive;
    private String createdAt;
    private String validUntil;

    private String targetType;
    private List<Long> targetIds;

    private Boolean isRead;

}
