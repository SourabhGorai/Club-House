package com.clubHouse.notification_service2.controller;

import com.clubHouse.notification_service2.client.ClubServiceClient;
import com.clubHouse.notification_service2.client.EventServiceClient;
import com.clubHouse.notification_service2.client.IndependentServiceClient;
import com.clubHouse.notification_service2.client.ProfileManagementServiceClient;
import com.clubHouse.notification_service2.dto.ApiResponse;
import com.clubHouse.notification_service2.service.JwtService;
import com.clubHouse.notification_service2.exception.ServiceException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Internal endpoint for cache eviction.
 *
 * These should be called by other microservices (or an admin) when
 * a club/department/event is updated, so the notification service
 * doesn't serve stale source names.
 *
 * All endpoints are admin/moderator only.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications/cache")
public class CacheAdminController {

    private final ClubServiceClient clubServiceClient;
    private final IndependentServiceClient indServiceClient;
    private final EventServiceClient eventServiceClient;
    private final ProfileManagementServiceClient profileServiceClient;
    private final JwtService jwtService;

    // ── Club ──────────────────────────────────────────────────────────────────

    /**
     * DELETE /api/notifications/cache/club/{clubId}
     * Evict a single club from cache (e.g. after a club is renamed).
     */
    @DeleteMapping("/club/{clubId}")
    public ResponseEntity<ApiResponse<Void>> evictClub(
            @PathVariable Long clubId,
            HttpServletRequest httpReq
    ) {
        requireAdmin(httpReq);
        clubServiceClient.evictClubCache(clubId);
        return ok("Club cache evicted for id=" + clubId);
    }

    // ── Department ────────────────────────────────────────────────────────────

    /**
     * DELETE /api/notifications/cache/department/{departmentId}
     * Evict a single department + the full list cache.
     */
    @DeleteMapping("/department/{departmentId}")
    public ResponseEntity<ApiResponse<Void>> evictDepartment(
            @PathVariable Long departmentId,
            HttpServletRequest httpReq
    ) {
        requireAdmin(httpReq);
        indServiceClient.evictDepartmentCache(departmentId);
        return ok("Department cache evicted for id=" + departmentId);
    }

    /**
     * DELETE /api/notifications/cache/departments
     * Evict the full departments list (e.g. after a new department is added).
     */
    @DeleteMapping("/departments")
    public ResponseEntity<ApiResponse<Void>> evictAllDepartments(HttpServletRequest httpReq) {
        requireAdmin(httpReq);
        indServiceClient.evictAllDepartmentsCache();
        return ok("All-departments list cache evicted");
    }

    // ── Event ─────────────────────────────────────────────────────────────────

    /**
     * DELETE /api/notifications/cache/event/{eventId}
     * Evict a single event from cache (e.g. after event title is updated).
     */
    @DeleteMapping("/event/{eventId}")
    public ResponseEntity<ApiResponse<Void>> evictEvent(
            @PathVariable Long eventId,
            HttpServletRequest httpReq
    ) {
        requireAdmin(httpReq);
        eventServiceClient.evictEventCache(eventId);
        return ok("Event cache evicted for id=" + eventId);
    }

    // ── Profile ───────────────────────────────────────────────────────────────

    /**
     * DELETE /api/notifications/cache/profile/{prn}
     * Evict a user's cached dept+year data (e.g. after they change department).
     * Without this, their /me feed would reflect the old department for up to 30 min.
     */
    @DeleteMapping("/profile/{prn}")
    public ResponseEntity<ApiResponse<Void>> evictProfile(
            @PathVariable String prn,
            HttpServletRequest httpReq
    ) {
        requireAdmin(httpReq);
        profileServiceClient.evictProfileDataCache(prn);
        return ok("Profile data cache evicted for prn=" + prn);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void requireAdmin(HttpServletRequest req) {
        String role = jwtService.extractRoleFromHeaders(req);
        if ("USERS".equals(role)) {
            throw new ServiceException("Insufficient permissions to manage cache");
        }
    }

    private ResponseEntity<ApiResponse<Void>> ok(String message) {
        return ResponseEntity.ok(ApiResponse.success(message, null));
    }
}