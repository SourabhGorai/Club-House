package com.profile.profile_management_service.exception;

import com.profile.profile_management_service.dto.ApiResponse;
import com.profile.profile_management_service.dto.ValidationError;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Global exception handler for the Profile Management Service
 * Handles all exceptions and returns appropriate HTTP responses
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<?> handleUserNotFound(UserNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                        "status", 404,
                        "message", ex.getMessage()
                ));
    }


    /**
     * Handle ProfileNotFoundException
     */
    @ExceptionHandler(ProfileNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleProfileNotFound(
            ProfileNotFoundException ex, WebRequest request) {
        log.error("Profile not found: {} | Request: {}", ex.getMessage(), request.getDescription(false));

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .errorCode("PROFILE_NOT_FOUND")
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    /**
     * Handle ProfileAlreadyExistsException
     */
    @ExceptionHandler(ProfileAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Void>> handleProfileAlreadyExists(
            ProfileAlreadyExistsException ex, WebRequest request) {
        log.error("Profile already exists: {} | Request: {}", ex.getMessage(), request.getDescription(false));

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .errorCode("PROFILE_ALREADY_EXISTS")
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    /**
     * Handle InvalidImageException
     */
    @ExceptionHandler(InvalidImageException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidImage(
            InvalidImageException ex, WebRequest request) {
        log.error("Invalid image: {} | Request: {}", ex.getMessage(), request.getDescription(false));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .errorCode("INVALID_IMAGE")
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    /**
     * Handle ProfileOperationException
     */
    @ExceptionHandler(ProfileOperationException.class)
    public ResponseEntity<ApiResponse<Void>> handleProfileOperation(
            ProfileOperationException ex, WebRequest request) {
        log.error("Profile operation failed: {} | Request: {}", ex.getMessage(),
                request.getDescription(false), ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .errorCode("OPERATION_FAILED")
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    /**
     * Handle ProfileValidationException
     */
    @ExceptionHandler(ProfileValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleProfileValidation(
            ProfileValidationException ex, WebRequest request) {
        log.error("Validation failed: {} | Request: {}", ex.getMessage(), request.getDescription(false));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .errorCode("VALIDATION_FAILED")
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    /**
     * Handle DuplicateDataException
     */
    @ExceptionHandler(DuplicateDataException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleDuplicateData(
            DuplicateDataException ex, WebRequest request) {
        log.error("Duplicate data detected - Field: {}, Value: {} | Request: {}",
                ex.getField(), ex.getValue(), request.getDescription(false));

        Map<String, String> details = new HashMap<>();
        details.put("field", ex.getField());
        details.put("value", ex.getValue());

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.<Map<String, String>>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .errorCode("DUPLICATE_DATA")
                        .data(details)
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    /**
     * Handle UnauthorizedAccessException
     */
    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorizedAccess(
            UnauthorizedAccessException ex, WebRequest request) {
        log.error("Unauthorized access attempt: {} | Request: {}", ex.getMessage(),
                request.getDescription(false));

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .errorCode("UNAUTHORIZED")
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    /**
     * Handle ForbiddenAccessException
     */
    @ExceptionHandler(ForbiddenAccessException.class)
    public ResponseEntity<ApiResponse<Void>> handleForbiddenAccess(
            ForbiddenAccessException ex, WebRequest request) {
        log.error("Forbidden access attempt: {} | Request: {}", ex.getMessage(),
                request.getDescription(false));

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .errorCode("FORBIDDEN")
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    /**
     * Handle BatchOperationException
     */
    @ExceptionHandler(BatchOperationException.class)
    public ResponseEntity<ApiResponse<Map<String, Integer>>> handleBatchOperation(
            BatchOperationException ex, WebRequest request) {
        log.error("Batch operation partially failed: {} | Success: {}, Failures: {} | Request: {}",
                ex.getMessage(), ex.getSuccessCount(), ex.getFailureCount(),
                request.getDescription(false));

        Map<String, Integer> details = new HashMap<>();
        details.put("successCount", ex.getSuccessCount());
        details.put("failureCount", ex.getFailureCount());

        return ResponseEntity.status(HttpStatus.MULTI_STATUS)
                .body(ApiResponse.<Map<String, Integer>>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .errorCode("BATCH_OPERATION_FAILED")
                        .data(details)
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    /**
     * Handle ServiceUnavailableException
     */
    @ExceptionHandler(ServiceUnavailableException.class)
    public ResponseEntity<ApiResponse<Void>> handleServiceUnavailable(
            ServiceUnavailableException ex, WebRequest request) {
        log.error("Service unavailable: {} | Request: {}", ex.getMessage(),
                request.getDescription(false), ex);

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .errorCode("SERVICE_UNAVAILABLE")
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    /**
     * Handle DatabaseOperationException
     */
    @ExceptionHandler(DatabaseOperationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDatabaseOperation(
            DatabaseOperationException ex, WebRequest request) {
        log.error("Database operation failed: {} | Request: {}", ex.getMessage(),
                request.getDescription(false), ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message("Database operation failed")
                        .errorCode("DATABASE_ERROR")
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    /**
     * Handle MethodArgumentNotValidException (Bean Validation)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<List<ValidationError>>> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {
        log.error("Validation error occurred | Request: {}", request.getDescription(false));

        List<ValidationError> errors = ex.getBindingResult().getAllErrors().stream()
                .map(error -> {
                    String fieldName = ((FieldError) error).getField();
                    String errorMessage = error.getDefaultMessage();
                    String rejectedValue = ((FieldError) error).getRejectedValue() != null ?
                            ((FieldError) error).getRejectedValue().toString() : "null";

                    log.debug("Validation error - Field: {}, Message: {}, RejectedValue: {}",
                            fieldName, errorMessage, rejectedValue);

                    return ValidationError.builder()
                            .field(fieldName)
                            .message(errorMessage)
                            .rejectedValue(rejectedValue)
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<List<ValidationError>>builder()
                        .success(false)
                        .message("Validation failed")
                        .errorCode("VALIDATION_ERROR")
                        .data(errors)
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    /**
     * Handle MaxUploadSizeExceededException
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxUploadSizeExceeded(
            MaxUploadSizeExceededException ex, WebRequest request) {
        log.error("File size exceeded: {} | Request: {}", ex.getMessage(),
                request.getDescription(false));

        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message("File size exceeds maximum limit of 500KB")
                        .errorCode("FILE_SIZE_EXCEEDED")
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    /**
     * Handle DataIntegrityViolationException
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, WebRequest request) {
        log.error("Data integrity violation: {} | Request: {}", ex.getMessage(),
                request.getDescription(false), ex);

        String message = "Data integrity violation. This might be due to duplicate values or constraint violations.";

        if (ex.getMessage() != null) {
            if (ex.getMessage().contains("prn")) {
                message = "PRN already exists in the system";
            } else if (ex.getMessage().contains("user_id")) {
                message = "User ID already has a profile";
            } else if (ex.getMessage().contains("phone_number")) {
                message = "Phone number already exists in the system";
            }
        }

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(message)
                        .errorCode("DATA_INTEGRITY_VIOLATION")
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    /**
     * Handle MethodArgumentTypeMismatchException
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodArgumentTypeMismatch(
            MethodArgumentTypeMismatchException ex, WebRequest request) {
        log.error("Type mismatch: {} | Request: {}", ex.getMessage(), request.getDescription(false));

        String message = String.format("Invalid value '%s' for parameter '%s'. Expected type: %s",
                ex.getValue(), ex.getName(), ex.getRequiredType() != null ?
                        ex.getRequiredType().getSimpleName() : "Unknown");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(message)
                        .errorCode("TYPE_MISMATCH")
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    /**
     * Handle HttpMessageNotReadableException
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, WebRequest request) {
        log.error("Malformed JSON request: {} | Request: {}", ex.getMessage(),
                request.getDescription(false));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message("Malformed JSON request. Please check your request body.")
                        .errorCode("MALFORMED_JSON")
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    /**
     * Handle IllegalArgumentException
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(
            IllegalArgumentException ex, WebRequest request) {
        log.error("Illegal argument: {} | Request: {}", ex.getMessage(), request.getDescription(false));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .errorCode("ILLEGAL_ARGUMENT")
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    /**
     * Handle all other exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(
            Exception ex, WebRequest request) {
        log.error("Unexpected error occurred: {} | Request: {}", ex.getMessage(),
                request.getDescription(false), ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<Void>builder()
                        .success(false)
                        .message("An unexpected error occurred. Please try again later.")
                        .errorCode("INTERNAL_SERVER_ERROR")
                        .timestamp(LocalDateTime.now())
                        .build());
    }
}