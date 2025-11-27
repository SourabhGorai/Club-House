package com.notificationservice.notification_service.exception;

public class NotificationNotFoundException extends RuntimeException {
    public NotificationNotFoundException(String id) {
        super("Notification not found with ID: " + id);
    }
}