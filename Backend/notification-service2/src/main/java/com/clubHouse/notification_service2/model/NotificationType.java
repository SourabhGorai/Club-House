package com.clubHouse.notification_service2.model;

import lombok.Builder;

public enum NotificationType {
    GLOBAL,
    CLUB_SPECIFIC,
    DEPARTMENT,
    YEAR_SPECIFIC,
    CLUB_AND_YEAR,
    DEPT_AND_YEAR,
    REMINDER,
    EVENT_SPECIFIC
}
