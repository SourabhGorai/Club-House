package com.notificationservice.notification_service.model;

public enum NotificationStatus {
    ACTIVE,      // Active notification
    ARCHIVED,    // Archived but not deleted
    EXPIRED,     // Passed expiry date
    CANCELLED    // Cancelled by sender
}