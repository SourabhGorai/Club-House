package com.profile.profile_management_service.exception;

class BatchOperationException extends RuntimeException {

    private final int successCount;
    private final int failureCount;

    public BatchOperationException(String message, int successCount, int failureCount) {
        super(message);
        this.successCount = successCount;
        this.failureCount = failureCount;
    }

    public int getSuccessCount() {
        return successCount;
    }

    public int getFailureCount() {
        return failureCount;
    }
}