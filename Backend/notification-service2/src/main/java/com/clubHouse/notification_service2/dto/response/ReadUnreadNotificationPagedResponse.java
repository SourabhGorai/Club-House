package com.clubHouse.notification_service2.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

// dto/response/ReadUnreadNotificationPagedResponse.java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReadUnreadNotificationPagedResponse {
    private Page<NotificationResponse> read;
    private Page<NotificationResponse> unread;
}