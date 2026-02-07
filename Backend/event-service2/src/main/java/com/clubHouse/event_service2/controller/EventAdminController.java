package com.clubHouse.event_service2.controller;

import com.clubHouse.event_service2.dto.ApiResponse;
import com.clubHouse.event_service2.scheduler.EnrollmentStatusScheduler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events/admin")
@RequiredArgsConstructor
@Slf4j
public class EventAdminController {

    private final EnrollmentStatusScheduler enrollmentStatusScheduler;

    /**
     * Manual trigger to close expired enrollments (for testing or admin use)
     * POST /api/events/admin/close-expired-enrollments
     */
    @PostMapping("/close-expired-enrollments")
    public ResponseEntity<ApiResponse<String>> closeExpiredEnrollments() {
        log.info("🔧 Manual trigger: Closing expired enrollments");
        
        enrollmentStatusScheduler.closeExpiredEnrollments();
        
        return ResponseEntity.ok(ApiResponse.success(
                "Successfully processed enrollment deadline closures",
                "Check logs for details"
        ));
    }
}