package com.clubHouse.notification_service2.controller;

import com.clubHouse.notification_service2.dto.ApiResponse;
import com.clubHouse.notification_service2.dto.request.NotificationRequest;
import com.clubHouse.notification_service2.dto.response.NotificationResponse;
import com.clubHouse.notification_service2.dto.response.ReadUnreadNotificationPagedResponse;
import com.clubHouse.notification_service2.dto.response.ReadUnreadNotificationResponse;
import com.clubHouse.notification_service2.model.NotificationType;
import com.clubHouse.notification_service2.model.SourceType;
import com.clubHouse.notification_service2.model.TargetType;
import com.clubHouse.notification_service2.service.JwtService;
import com.clubHouse.notification_service2.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import com.clubHouse.notification_service2.dto.request.NotificationUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notification")
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtService jwtService;

    // ── Private helpers ───────────────────────────────────────────────────────

    private String prn(HttpServletRequest req) {
        return jwtService.extractPrnFromHeaders(req);
    }

    private String role(HttpServletRequest req) {
        return jwtService.extractRoleFromHeaders(req);
    }

    private Pageable pageable(int page, int size) {
        return PageRequest.of(page, size, Sort.by("createdAt").descending());
    }

    private <T> ResponseEntity<ApiResponse<T>> ok(String message, T data) {
        return ResponseEntity.ok(ApiResponse.success(message, data));
    }

    // ── Create ────────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<ApiResponse<NotificationResponse>> create(
            @Valid @RequestBody NotificationRequest req,
            HttpServletRequest httpReq
    ) {
        log.info("Request to create notification");
        NotificationResponse resp = notificationService.createNotification(req, prn(httpReq), role(httpReq));
        return ok("Notification created successfully", resp);
    }

    // ── Get by ID ─────────────────────────────────────────────────────────────

    /**
     * GET /api/notifications/{notificationId}
     * Fetch a single notification by its ID.
     */
    @GetMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<NotificationResponse>> getById(
            @PathVariable Long notificationId
    ) {
        log.debug("Fetching notificationId={}", notificationId);
        NotificationResponse resp = notificationService.getById(notificationId);
        return ok("Fetched successfully", resp);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    /**
     * PATCH /api/notifications/{notificationId}
     * Partially update a notification's title, message, or validUntil.
     * Only non-null fields in the request body are applied.
     * Admin/moderator only.
     */
    @PatchMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<NotificationResponse>> update(
            @PathVariable Long notificationId,
            @RequestBody NotificationUpdateRequest req,
            HttpServletRequest httpReq
    ) {
        log.info("Updating notificationId={}", notificationId);
        NotificationResponse resp = notificationService.update(notificationId, req, role(httpReq));
        return ok("Notification updated successfully", resp);
    }

    // ── My Unread ─────────────────────────────────────────────────────────────

    /**
     * GET /api/notifications/me/unread
     * Returns only unread notifications for the current user.
     */
    @GetMapping("/me/unread")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyUnread(
            HttpServletRequest httpReq
    ) {
        log.debug("Fetching unread notifications");
        List<NotificationResponse> resp = notificationService.getMyUnreadNotifications(prn(httpReq));
        return ok(String.format("Fetched %d unread notifications", resp.size()), resp);
    }

    /**
     * GET /api/notifications/me/unread/paged?page=0&size=10
     */
    @GetMapping("/me/unread/paged")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getMyUnreadPaged(
            HttpServletRequest httpReq,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.debug("Fetching unread notifications (paginated)");
        Page<NotificationResponse> resp =
                notificationService.getMyUnreadNotificationsPaged(prn(httpReq), pageable(page, size));
        return ok(String.format("Fetched %d unread notifications", resp.getTotalElements()), resp);
    }

    // ── Unread Count ──────────────────────────────────────────────────────────

    /**
     * GET /api/notifications/me/unread-count
     * Returns the number of unread notifications for the current user.
     * Intended for the frontend bell-icon badge.
     */
    @GetMapping("/me/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(HttpServletRequest httpReq) {
        log.debug("Fetching unread count");
        long count = notificationService.getUnreadCount(prn(httpReq));
        return ok("Unread count fetched", count);
    }

    // ── Reactivate ────────────────────────────────────────────────────────────

    /**
     * PATCH /api/notifications/{notificationId}/reactivate
     * Brings a deactivated notification back to active. Admin/moderator only.
     * Note: if validUntil is in the past, update it via PATCH /{id} afterwards,
     * otherwise the notification will still be filtered from user feeds.
     */
    @PatchMapping("/{notificationId}/reactivate")
    public ResponseEntity<ApiResponse<Void>> reactivate(
            @PathVariable Long notificationId,
            HttpServletRequest httpReq
    ) {
        log.info("Reactivating notificationId={}", notificationId);
        notificationService.reactivate(notificationId, role(httpReq));
        return ok("Notification reactivated", null);
    }

    // ── Get All (admin/staff) ─────────────────────────────────────────────────

    /**
     * GET /api/notifications?active=true
     * Returns all active (or inactive) notifications as a flat list.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getAll(
            @RequestParam(defaultValue = "true") boolean active
    ) {
        log.info("Fetching all notifications, active={}", active);
        List<NotificationResponse> resp = notificationService.getAll(active);
        return ok(String.format("Fetched %d notifications", resp.size()), resp);
    }

    /**
     * GET /api/notifications/paged?active=true&page=0&size=10
     */
    @GetMapping("/paged")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getAllPaged(
            @RequestParam(defaultValue = "true") boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("Fetching paginated notifications, active={}, page={}, size={}", active, page, size);
        Page<NotificationResponse> resp = notificationService.getAllPaged(active, pageable(page, size));
        return ok(String.format("Fetched %d notifications", resp.getTotalElements()), resp);
    }

    // ── Read / Unread Split ───────────────────────────────────────────────────────

    /**
     * GET /api/notification/me/read-unread
     * Returns all notifications split into read and unread buckets for the current user.
     */
    @GetMapping("/admin/read-unread")
    public ResponseEntity<ApiResponse<ReadUnreadNotificationResponse>> getReadUnread(
            HttpServletRequest httpReq
    ) {
        log.debug("Fetching read/unread notifications for prn={}", prn(httpReq));
        ReadUnreadNotificationResponse resp = notificationService.getAllReadUnread(prn(httpReq));
        return ok(String.format(
                "Fetched %d read and %d unread notifications",
                resp.getRead().size(),
                resp.getUnread().size()
        ), resp);
    }

    /**
     * GET /api/notification/me/read-unread/paged?page=0&size=10
     * Same as above but both read and unread lists are independently paginated.
     */
    @GetMapping("/admin/read-unread/paged")
    public ResponseEntity<ApiResponse<ReadUnreadNotificationPagedResponse>> getReadUnreadPaged(
            HttpServletRequest httpReq,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.debug("Fetching read/unread notifications (paginated) for prn={}", prn(httpReq));
        ReadUnreadNotificationPagedResponse resp =
                notificationService.getAllReadUnreadPaged(prn(httpReq), pageable(page, size));
        return ok(String.format(
                "Fetched %d read and %d unread notifications",
                resp.getRead().getTotalElements(),
                resp.getUnread().getTotalElements()
        ), resp);
    }

    // ── My Notifications ──────────────────────────────────────────────────────

    @GetMapping("/trigger/{notificationId}")
    public ResponseEntity<ApiResponse<NotificationResponse>> triggerNotification(
            @PathVariable Long notificationId,
            HttpServletRequest httpReq
    ) {
        log.info("Request received to trigger notification with Id: {}", notificationId);
        NotificationResponse resp = notificationService.triggerNotification(
                notificationId, prn(httpReq), role(httpReq));
        return ok(
                "Successfully created trigger for notification",
                resp
        );
    }

    // ── My Notifications ──────────────────────────────────────────────────────

    /**
     * GET /api/notifications/me
     * Returns all valid notifications relevant to the current user
     * (their dept, clubs, enrolled events + global). Includes isRead flag.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications(
            HttpServletRequest httpReq
    ) {
        log.debug("Fetching my notifications");
        List<NotificationResponse> resp = notificationService.getMyNotifications(prn(httpReq));
        return ok(String.format("Fetched %d notifications", resp.size()), resp);
    }

    /**
     * GET /api/notifications/me/paged?page=0&size=10
     */
    @GetMapping("/me/paged")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getMyNotificationsPaged(
            HttpServletRequest httpReq,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.debug("Fetching my notifications (paginated)");
        Page<NotificationResponse> resp =
                notificationService.getMyNotificationsPaged(prn(httpReq), pageable(page, size));
        return ok(String.format("Fetched %d notifications", resp.getTotalElements()), resp);
    }

    // ── Read Status ───────────────────────────────────────────────────────────

    /**
     * PATCH /api/notifications/{notificationId}/read
     * Marks a single notification as read for the current user.
     */
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long notificationId,
            HttpServletRequest httpReq
    ) {
        log.debug("Marking notificationId={} as read", notificationId);
        notificationService.markAsRead(notificationId, prn(httpReq));
        return ok("Notification marked as read", null);
    }

    /**
     * PATCH /api/notifications/me/read-all
     * Marks all of the current user's notifications as read.
     */
    @PatchMapping("/me/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(HttpServletRequest httpReq) {
        log.debug("Marking all notifications as read");
        notificationService.markAllAsRead(prn(httpReq));
        return ok("All notifications marked as read", null);
    }

    // ── Filter Endpoints ──────────────────────────────────────────────────────

    /**
     * GET /api/notifications/by-source/{sourceType}
     */
    @GetMapping("/by-source/{sourceType}")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getBySourceType(
            @PathVariable SourceType sourceType
    ) {
        log.debug("Fetching notifications, sourceType={}", sourceType);
        List<NotificationResponse> resp = notificationService.getBySourceType(sourceType);
        return ok(String.format("Fetched %d notifications", resp.size()), resp);
    }

    /**
     * GET /api/notifications/by-source/{sourceType}/paged?page=0&size=10
     */
    @GetMapping("/by-source/{sourceType}/paged")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getBySourceTypePaged(
            @PathVariable SourceType sourceType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<NotificationResponse> resp =
                notificationService.getBySourceTypePaged(sourceType, pageable(page, size));
        return ok(String.format("Fetched %d notifications", resp.getTotalElements()), resp);
    }

    /**
     * GET /api/notifications/by-type/{nType}
     */
    @GetMapping("/by-type/{nType}")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getByNotificationType(
            @PathVariable NotificationType nType
    ) {
        log.debug("Fetching notifications, notificationType={}", nType);
        List<NotificationResponse> resp = notificationService.getByNotificationType(nType);
        return ok(String.format("Fetched %d notifications", resp.size()), resp);
    }

    /**
     * GET /api/notifications/by-type/{nType}/paged?page=0&size=10
     */
    @GetMapping("/by-type/{nType}/paged")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getByNotificationTypePaged(
            @PathVariable NotificationType nType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<NotificationResponse> resp =
                notificationService.getByNotificationTypePaged(nType, pageable(page, size));
        return ok(String.format("Fetched %d notifications", resp.getTotalElements()), resp);
    }

    /**
     * GET /api/notifications/by-target/{targetType}
     */
    @GetMapping("/by-target/{targetType}")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getByTargetType(
            @PathVariable TargetType targetType
    ) {
        log.debug("Fetching notifications, targetType={}", targetType);
        List<NotificationResponse> resp = notificationService.getByTargetType(targetType);
        return ok(String.format("Fetched %d notifications", resp.size()), resp);
    }

    @GetMapping("/cr/created-by-me")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getCreatedByMe(
            HttpServletRequest httpReq
    ) {
        String prn = jwtService.extractPrnFromHeaders(httpReq);
        log.info("Request received to fetch notifications created by prn: {}", prn);
        List<NotificationResponse> resp = notificationService.getCreatedByMe(prn);
        return ok(String.format("Fetched %d notifications", resp.size()), resp);
    }

    @GetMapping("/cr/created-by-me/paged")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getCreatedByMePaged(
            HttpServletRequest httpReq,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        String prn = jwtService.extractPrnFromHeaders(httpReq);
        log.info("Request received to fetch paginated notifications created by prn: {}", prn);
        Page<NotificationResponse> resp =
                notificationService.getCreatedByMePaged(prn, pageable(page, size));
        return ok(String.format("Fetched %d notifications", resp.getTotalElements()), resp);
    }

    // ── Deactivate / Delete ───────────────────────────────────────────────────

    /**
     * PATCH /api/notifications/{notificationId}/deactivate
     * Soft-deletes a notification (sets isActive = false). Admin/moderator only.
     */
    @PatchMapping("/{notificationId}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivate(
            @PathVariable Long notificationId,
            HttpServletRequest httpReq
    ) {
        log.info("Deactivating notificationId={}", notificationId);
        notificationService.deactivate(notificationId, role(httpReq));
        return ok("Notification deactivated", null);
    }

    /**
     * DELETE /api/notifications/{notificationId}
     * Hard-deletes a notification and all associated targets/seen records. Admin/moderator only.
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long notificationId,
            HttpServletRequest httpReq
    ) {
        log.info("Deleting notificationId={}", notificationId);
        notificationService.delete(notificationId, role(httpReq));
        return ok("Notification deleted", null);
    }

    // ── Metadata ──────────────────────────────────────────────────────────────

    @GetMapping("/meta/notification-types")
    public ResponseEntity<ApiResponse<List<String>>> getNotificationTypes() {
        return ok("Fetched successfully", notificationService.fetchNotificationTargets());
    }

    @GetMapping("/meta/source-types")
    public ResponseEntity<ApiResponse<List<String>>> getSourceTypes() {
        return ok("Fetched successfully", notificationService.fetchSourceTypes());
    }

    @GetMapping("/meta/target-types")
    public ResponseEntity<ApiResponse<List<String>>> getTargetTypes() {
        return ok("Fetched successfully", notificationService.fetchTargetTypes());
    }
}