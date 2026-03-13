package com.clubHouse.event_service2.controller;

import com.clubHouse.event_service2.dto.request.MarkAttendanceRequest;
import com.clubHouse.event_service2.dto.request.StartAttendanceRequest;
import com.clubHouse.event_service2.dto.response.ApiResponse;
import com.clubHouse.event_service2.dto.response.AttendanceListResponse;
import com.clubHouse.event_service2.dto.response.AttendanceResponse;
import com.clubHouse.event_service2.dto.response.QRCodeResponse;
import com.clubHouse.event_service2.service.AttendanceService;
import com.clubHouse.event_service2.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@Slf4j
public class AttendanceController {
    
    private final AttendanceService attendanceService;
    private final JwtService jwtService;
    
    /**
     * Start attendance session (Organizer/Admin only)
     * POST /api/attendance/start/{eventId}
     */
    @PostMapping("/start/{eventId}")
    public ResponseEntity<ApiResponse<QRCodeResponse>> AddAndStartAttendance(
            @PathVariable Long eventId,
            @Valid @RequestBody StartAttendanceRequest request,
            HttpServletRequest httpRequest
    ) {
        log.info("🚀 REST request to start attendance for event {}", eventId);
        String prn = jwtService.extractPrnFromHeaders(httpRequest);
        String role = jwtService.extractRoleFromHeaders(httpRequest);
        
        ApiResponse<QRCodeResponse> response = attendanceService.startAttendance(
                eventId, request, prn, role
        );
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/start/now/{eventId}")
    public ResponseEntity<ApiResponse<QRCodeResponse>> startAttendance(
            @PathVariable Long eventId,
            HttpServletRequest httpRequest
    ) {
        log.info("Request received to start the attendance for eventId: {}", eventId);
        String prn = jwtService.extractPrnFromHeaders(httpRequest);
        String role = jwtService.extractRoleFromHeaders(httpRequest);

        ApiResponse<QRCodeResponse> response = attendanceService.startAttendanceSaved(
                eventId, prn, role
        );

        return ResponseEntity.ok(response);
    }
    
    /**
     * Get current QR code (Organizer/Admin only)
     * GET /api/attendance/qr-code/{eventId}
     */
    @GetMapping("/qr-code/{eventId}")
    public ResponseEntity<ApiResponse<QRCodeResponse>> getCurrentQRCode(
            @PathVariable Long eventId,
            HttpServletRequest httpRequest
    ) {
        log.info("📱 REST request to get QR code for event {}", eventId);
        String prn = jwtService.extractPrnFromHeaders(httpRequest);
        String role = jwtService.extractRoleFromHeaders(httpRequest);
        
        ApiResponse<QRCodeResponse> response = attendanceService.getCurrentQRCode(
                eventId, prn, role
        );
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Mark attendance (Student)
     * POST /api/attendance/mark/{eventId}
     */
    @PostMapping("/mark/{eventId}")
    public ResponseEntity<ApiResponse<AttendanceResponse>> markAttendance(
            @PathVariable Long eventId,
            @Valid @RequestBody MarkAttendanceRequest request,
            HttpServletRequest httpRequest
    ) {
        String prn = jwtService.extractPrnFromHeaders(httpRequest);
        log.info("✋ REST request to mark attendance for PRN {} in event {}", prn, eventId);
        
        ApiResponse<AttendanceResponse> response = attendanceService.markAttendance(
                eventId, request, prn, httpRequest
        );
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Stop attendance session (Organizer/Admin only)
     * POST /api/attendance/stop/{eventId}
     */
    @PostMapping("/stop/{eventId}")
    public ResponseEntity<ApiResponse<String>> stopAttendance(
            @PathVariable Long eventId,
            HttpServletRequest httpRequest
    ) {
        log.info("🛑 REST request to stop attendance for event {}", eventId);
        String prn = jwtService.extractPrnFromHeaders(httpRequest);
        String role = jwtService.extractRoleFromHeaders(httpRequest);
        
        ApiResponse<String> response = attendanceService.stopAttendance(
                eventId, prn, role
        );
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get attendance list for an event (Organizer/Admin):
     * GET /api/attendance/list/{eventId}
     */
    @GetMapping("/list/{eventId}")
    public ResponseEntity<ApiResponse<AttendanceListResponse>> getAttendanceList(
            @PathVariable Long eventId
    ) {
        log.info("📋 REST request to get attendance list for event {}", eventId);
        
        ApiResponse<AttendanceListResponse> response = attendanceService.getAttendanceList(eventId);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get my attendance records (Student)
     * GET /api/attendance/my-attendance
     */
    @GetMapping("/my-attendance")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getMyAttendance(
            HttpServletRequest httpRequest
    ) {
        String prn = jwtService.extractPrnFromHeaders(httpRequest);
        log.info("📝 REST request to get attendance records for PRN {}", prn);
        
        ApiResponse<List<AttendanceResponse>> response = attendanceService.getMyAttendance(prn);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Check attendance status for a specific event (Student)
     * GET /api/attendance/status/{eventId}
     */
    @GetMapping("/status/{eventId}")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkAttendanceStatus(
            @PathVariable Long eventId,
            HttpServletRequest httpRequest
    ) {
        String prn = jwtService.extractPrnFromHeaders(httpRequest);
        log.info("🔍 REST request to check attendance status for PRN {} in event {}", prn, eventId);
        
        ApiResponse<AttendanceResponse> response = attendanceService.checkMyAttendanceStatus(
                eventId, prn
        );
        
        return ResponseEntity.ok(response);
    }
}