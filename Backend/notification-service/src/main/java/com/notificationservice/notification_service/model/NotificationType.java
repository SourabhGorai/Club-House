package com.notificationservice.notification_service.model;

public enum NotificationType {
    GLOBAL,          // To all users
    PERSONAL,        // To specific user
    CLUB_SPECIFIC,   // To members of specific clubs
    DEPARTMENT,      // To specific departments
    YEAR_SPECIFIC,   // To specific academic years
    CLUB_AND_YEAR,   // Combination of club and year
    DEPT_AND_YEAR    // Combination of department and year
}