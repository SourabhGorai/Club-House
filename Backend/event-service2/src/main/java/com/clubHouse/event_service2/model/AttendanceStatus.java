package com.clubHouse.event_service2.model;

public enum AttendanceStatus {
    PRESENT,
    ABSENT,
    LATE;
    
    public static AttendanceStatus from(String value) {
        if (value == null) {
            throw new IllegalArgumentException("AttendanceStatus cannot be null");
        }
        try {
            return AttendanceStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                "Invalid AttendanceStatus: " + value +
                ". Allowed values: " + java.util.Arrays.toString(AttendanceStatus.values())
            );
        }
    }
}