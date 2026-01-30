package com.clubHouse.event_service2.model;

public enum TargetType {
    DEPARTMENT,
    GLOBAL,
    CLUB;

    public static TargetType from(String value) {
        if (value == null) {
            throw new IllegalArgumentException("TargetType cannot be null");
        }

        try {
            return TargetType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Invalid TargetType: " + value +
                            ". Allowed values: " + java.util.Arrays.toString(TargetType.values())
            );
        }
    }
}

