package com.profile.profile_management_service.exception;

public class DuplicateDataException extends RuntimeException {

    private final String field;
    private final String value;

    public DuplicateDataException(String field, String value, String message) {
        super(message);
        this.field = field;
        this.value = value;
    }

    public String getField() {
        return field;
    }

    public String getValue() {
        return value;
    }
}