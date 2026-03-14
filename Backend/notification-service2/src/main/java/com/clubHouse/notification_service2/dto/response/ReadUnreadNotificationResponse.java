// dto/response/ReadUnreadNotificationResponse.java
package com.clubHouse.notification_service2.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReadUnreadNotificationResponse {
    private List<NotificationResponse> read;
    private List<NotificationResponse> unread;
}