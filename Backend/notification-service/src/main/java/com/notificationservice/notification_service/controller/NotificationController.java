package com.notificationservice.notification_service.controller;

import com.notificationservice.notification_service.dto.*;
import com.notificationservice.notification_service.service.NotificationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Validated
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Creates a new notification
     * POST /api/notifications
     */
    @PostMapping
    public ResponseEntity<ApiResponse<NotificationResponse>> createNotification(
            @Valid @RequestBody NotificationCreateRequest request) {

        log.info("Request to create notification of type: {} by sender: {}",
                request.getNotificationType(), request.getSenderPrn());

        NotificationResponse response = notificationService.createNotification(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Notification created successfully", response));
    }

    /**
     * Gets notifications for the current user
     * GET /api/notifications/user/{prn}
     */
    @GetMapping("/user/{prn}")
    public ResponseEntity<ApiResponse<PagedNotificationResponse>> getUserNotifications(
            @PathVariable String prn,
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(defaultValue = "0") @Min(0) Integer page,
            @RequestParam(defaultValue = "20") @Min(1) Integer size) {

        log.debug("Fetching notifications for user: {}, page: {}, size: {}", prn, page, size);

        PagedNotificationResponse response = notificationService
                .getUserNotifications(prn, isRead, page, size);

        return ResponseEntity.ok(
                ApiResponse.success("Notifications retrieved successfully", response));
    }

    /**
     * Gets a specific notification by ID
     * GET /api/notifications/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NotificationResponse>> getNotificationById(
            @PathVariable String id,
            @RequestParam String requesterPrn) {

        log.debug("Fetching notification: {} for user: {}", id, requesterPrn);

        NotificationResponse response = notificationService
                .getNotificationById(id, requesterPrn);

        return ResponseEntity.ok(
                ApiResponse.success("Notification retrieved successfully", response));
    }

    /**
     * Marks a notification as read
     * PUT /api/notifications/{id}/read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @PathVariable String id,
            @RequestParam String requesterPrn) {

        log.info("Marking notification {} as read by user: {}", id, requesterPrn);

        NotificationResponse response = notificationService.markAsRead(id, requesterPrn);

        return ResponseEntity.ok(
                ApiResponse.success("Notification marked as read", response));
    }

    /**
     * Marks multiple notifications as read
     * PUT /api/notifications/bulk-read
     */
    @PutMapping("/bulk-read")
    public ResponseEntity<ApiResponse<Void>> bulkMarkAsRead(
            @Valid @RequestBody BulkMarkReadRequest request,
            @RequestParam String requesterPrn) {

        log.info("Bulk marking {} notifications as read by user: {}",
                request.getNotificationIds().size(), requesterPrn);

        notificationService.bulkMarkAsRead(request, requesterPrn);

        return ResponseEntity.ok(
                ApiResponse.success("Notifications marked as read", null));
    }

    /**
     * Deletes a notification (soft delete)
     * DELETE /api/notifications/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @PathVariable String id,
            @RequestParam String requesterPrn) {

        log.info("Deleting notification: {} by user: {}", id, requesterPrn);

        notificationService.deleteNotification(id, requesterPrn);

        return ResponseEntity.ok(
                ApiResponse.success("Notification deleted successfully", null));
    }

    /**
     * Gets notifications sent by a user
     * GET /api/notifications/sent/{prn}
     */
    @GetMapping("/sent/{prn}")
    public ResponseEntity<ApiResponse<PagedNotificationResponse>> getSentNotifications(
            @PathVariable String prn,
            @RequestParam(defaultValue = "0") @Min(0) Integer page,
            @RequestParam(defaultValue = "20") @Min(1) Integer size) {

        log.debug("Fetching sent notifications for user: {}", prn);

        PagedNotificationResponse response = notificationService
                .getSentNotifications(prn, page, size);

        return ResponseEntity.ok(
                ApiResponse.success("Sent notifications retrieved successfully", response));
    }

    /**
     * Gets unread notification count for a user
     * GET /api/notifications/unread-count/{prn}
     */
    @GetMapping("/unread-count/{prn}")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@PathVariable String prn) {

        log.debug("Fetching unread count for user: {}", prn);

        Long count = notificationService.getUnreadCount(prn);

        return ResponseEntity.ok(
                ApiResponse.success("Unread count retrieved successfully", count));
    }

    /**
     * Gets notification statistics
     * GET /api/notifications/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<NotificationStatistics>> getStatistics() {

        log.debug("Fetching notification statistics");

        NotificationStatistics stats = notificationService.getStatistics();

        return ResponseEntity.ok(
                ApiResponse.success("Statistics retrieved successfully", stats));
    }

    /**
     * Archives old notifications (admin operation)
     * POST /api/notifications/archive
     */
    @PostMapping("/archive")
    public ResponseEntity<ApiResponse<Void>> archiveOldNotifications(
            @RequestParam(defaultValue = "90") Integer daysOld) {

        log.info("Archiving notifications older than {} days", daysOld);

        notificationService.archiveOldNotifications(daysOld);

        return ResponseEntity.ok(
                ApiResponse.success("Old notifications archived successfully", null));
    }

    /**
     * Processes expired notifications (admin operation)
     * POST /api/notifications/process-expired
     */
    @PostMapping("/process-expired")
    public ResponseEntity<ApiResponse<Void>> processExpiredNotifications() {

        log.info("Processing expired notifications");

        notificationService.processExpiredNotifications();

        return ResponseEntity.ok(
                ApiResponse.success("Expired notifications processed successfully", null));
    }

    /**
     * Health check endpoint
     * GET /api/notifications/health
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        log.debug("Health check endpoint called");
        return ResponseEntity.ok(
                ApiResponse.success("Notification Service is running", "OK"));
    }
}