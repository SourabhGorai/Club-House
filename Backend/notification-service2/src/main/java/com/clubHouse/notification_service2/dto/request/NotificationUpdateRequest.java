package com.clubHouse.notification_service2.dto.request;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * All fields are optional — only non-null fields will be applied to the notification.
 */
@Data
public class NotificationUpdateRequest {

    private String notificationTitle;

    private String message;

    /**
     * Pass null to keep the existing validUntil.
     * Pass a future date to extend/change expiry.
     */
    private LocalDateTime validUntil;
}