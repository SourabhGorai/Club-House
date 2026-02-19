package com.clubHouse.notification_service2.dto;

import com.clubHouse.notification_service2.model.SourceType;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
public class NotificationResponse {

    private Long notificationId;

    private String eventTitle;

    private String title;

    private String message;

    private SourceType sourceType;



//    private

}
