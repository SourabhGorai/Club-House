package com.clubHouse.event_service2.service;

import com.clubHouse.event_service2.dto.*;
import com.clubHouse.event_service2.exception.*;
import com.clubHouse.event_service2.model.*;
import com.clubHouse.event_service2.repository.AttendanceRepository;
import com.clubHouse.event_service2.repository.EventEnrollmentRepository;
import com.clubHouse.event_service2.repository.EventRepository;
import com.clubHouse.event_service2.util.GeoUtils;
import com.clubHouse.event_service2.util.QRCodeGenerator;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {
    
    private final AttendanceRepository attendanceRepository;
    private final EventRepository eventRepository;
    private final EventEnrollmentRepository enrollmentRepository;
    
    /**
     * Start attendance session for an event
     * Only event creator or SUPER_ADMIN can start
     */
    @Transactional
    public ApiResponse<QRCodeResponse> startAttendance(Long eventId, 
                                                       StartAttendanceRequest request,
                                                       String prn, 
                                                       String role) {
        log.info("Starting attendance for event {} by {}", eventId, prn);
        
        // 1. Find event
        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with ID: " + eventId));
        
        // 2. Authorization check
        if (!event.getEventCreator().equals(prn) && !"SUPER_ADMIN".equals(role)) {
            throw new UnauthorizedException("Only event creator or admin can start attendance");
        }
        
        // 3. Validate event is not completed
        if (event.isCompleted()) {
            throw new InvalidOperationException("Cannot start attendance for completed event");
        }
        
        // 4. Validate time window
        if (request.getAttendanceWindowStart().isAfter(request.getAttendanceWindowEnd())) {
            throw new InvalidOperationException("Attendance start time must be before end time");
        }
        
        // 5. Set location and attendance window
        event.setLatitude(request.getLatitude());
        event.setLongitude(request.getLongitude());
        event.setRadiusInMeters(request.getRadiusInMeters());
        event.setAttendanceWindowStart(request.getAttendanceWindowStart());
        event.setAttendanceWindowEnd(request.getAttendanceWindowEnd());
        
        // 6. Generate secret key if not exists
        if (event.getQrSecretKey() == null || event.getQrSecretKey().isEmpty()) {
            event.setQrSecretKey(QRCodeGenerator.generateSecretKey());
        }
        
        // 7. Mark attendance as enabled and active
        event.setAttendanceEnabled(true);
        event.startAttendance();
        
        eventRepository.save(event);
        
        // 8. Generate initial QR code
        String qrToken = QRCodeGenerator.generateQRToken(
                eventId, 
                event.getQrSecretKey(), 
                event.getQrRefreshIntervalSeconds()
        );
        
        LocalDateTime expiresAt = LocalDateTime.now()
                .plusSeconds(event.getQrRefreshIntervalSeconds());
        
        QRCodeResponse response = QRCodeResponse.builder()
                .qrToken(qrToken)
                .expiresAt(expiresAt)
                .refreshInSeconds(event.getQrRefreshIntervalSeconds())
                .attendanceActive(true)
                .build();
        
        log.info("✅ Attendance started for event {}", eventId);
        return ApiResponse.success("Attendance session started successfully", response);
    }

    @Transactional
    public ApiResponse<QRCodeResponse> startAttendanceSaved(Long eventId, String prn, String role) {
        log.info("Attempting to start attendance with saved details for event {}", eventId);

        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Events", eventId.toString()));

        // Validate saved details exist before attempting to start
        if (event.getLatitude() == null || event.getLongitude() == null ||
                event.getRadiusInMeters() == null ||
                event.getAttendanceWindowStart() == null ||
                event.getAttendanceWindowEnd() == null) {
            throw new ServiceException("Attendance location and time window must be configured before starting");
        }

        StartAttendanceRequest req = StartAttendanceRequest.builder()
                .latitude(event.getLatitude())
                .longitude(event.getLongitude())
                .radiusInMeters(event.getRadiusInMeters())
                .attendanceWindowStart(event.getAttendanceWindowStart())
                .attendanceWindowEnd(event.getAttendanceWindowEnd())
                .build();

        return startAttendance(eventId, req, prn, role);
    }
    
    /**
     * Get current QR code for organizer's display
     */
    public ApiResponse<QRCodeResponse> getCurrentQRCode(Long eventId, String prn, String role) {
        log.info("Fetching current QR code for event {}", eventId);
        
        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with ID: " + eventId));
        
        // Authorization check
        if (!event.getEventCreator().equals(prn) && !"SUPER_ADMIN".equals(role)) {
            throw new UnauthorizedException("Only event creator or admin can access QR code");
        }
        
        // Check if attendance is active
        if (!event.isAttendanceActive()) {
            throw new InvalidOperationException("Attendance is not active for this event");
        }
        
        // Generate current QR token
        String qrToken = QRCodeGenerator.generateQRToken(
                eventId, 
                event.getQrSecretKey(), 
                event.getQrRefreshIntervalSeconds()
        );
        
        // Calculate expiry time
        long currentTimeSeconds = System.currentTimeMillis() / 1000;
        long timeSlot = currentTimeSeconds / event.getQrRefreshIntervalSeconds();
        long nextTimeSlot = (timeSlot + 1) * event.getQrRefreshIntervalSeconds();
        long secondsUntilRefresh = nextTimeSlot - currentTimeSeconds;
        
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(secondsUntilRefresh);
        
        QRCodeResponse response = QRCodeResponse.builder()
                .qrToken(qrToken)
                .expiresAt(expiresAt)
                .refreshInSeconds((int) secondsUntilRefresh)
                .attendanceActive(true)
                .build();
        
        return ApiResponse.success("Current QR code fetched successfully", response);
    }
    
    /**
     * Mark attendance for a student
     * Validates: Time Window + QR Code + Geofencing
     */
    @Transactional
    public ApiResponse<AttendanceResponse> markAttendance(Long eventId, 
                                                          MarkAttendanceRequest request,
                                                          String prn,
                                                          HttpServletRequest httpRequest) {
        log.info("Marking attendance for PRN {} in event {}", prn, eventId);
        
        // 1. Find event
        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with ID: " + eventId));
        
        // 2. Check if student is enrolled
        boolean isEnrolled = enrollmentRepository.existsByEventAndPrn(event, prn);
        if (!isEnrolled) {
            log.warn("❌ PRN {} not enrolled in event {}", prn, eventId);
            return ApiResponse.error(
                    "NOT_ENROLLED",
                    "You must be enrolled in this event to mark attendance",
                    null
            );
        }
        
        // 3. Check if attendance is enabled
        if (!event.isAttendanceEnabled() || !event.isAttendanceActive()) {
            log.warn("❌ Attendance not active for event {}", eventId);
            return ApiResponse.error(
                    "ATTENDANCE_NOT_ACTIVE",
                    "Attendance is not currently active for this event",
                    null
            );
        }
        
        // 4. Validate Time Window
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(event.getAttendanceWindowStart())) {
            log.warn("❌ Attendance window not started for event {}", eventId);
            return ApiResponse.error(
                    "TIME_WINDOW_NOT_STARTED",
                    "Attendance window has not started yet",
                    null
            );
        }
        
        if (now.isAfter(event.getAttendanceWindowEnd())) {
            log.warn("❌ Attendance window closed for event {}", eventId);
            return ApiResponse.error(
                    "TIME_WINDOW_CLOSED",
                    "Attendance window has closed",
                    null
            );
        }
        
        // 5. Validate QR Code
        boolean isQRValid = QRCodeGenerator.validateQRToken(
                eventId, 
                event.getQrSecretKey(), 
                request.getQrToken(), 
                event.getQrRefreshIntervalSeconds()
        );
        
        if (!isQRValid) {
            log.warn("❌ Invalid QR code for event {}", eventId);
            return ApiResponse.error(
                    "INVALID_QR_CODE",
                    "QR code is invalid or expired. Please scan the latest code.",
                    null
            );
        }
        
        // 6. Validate Geofencing (Location)
        double distance = GeoUtils.calculateDistance(
                event.getLatitude(), event.getLongitude(),
                request.getLatitude(), request.getLongitude()
        );
        
        if (distance > event.getRadiusInMeters()) {
            log.warn("❌ PRN {} is {}m away (required: {}m)", prn, (int) distance, event.getRadiusInMeters());
            return ApiResponse.error(
                    "LOCATION_OUT_OF_RANGE",
                    String.format("You are %.0fm away from the event location. Required: within %dm", 
                            distance, event.getRadiusInMeters()),
                    null
            );
        }
        
        // 7. Check if already marked
        if (attendanceRepository.existsByEventAndPrn(event, prn)) {
            log.warn("❌ Attendance already marked for PRN {} in event {}", prn, eventId);
            return ApiResponse.error(
                    "ALREADY_MARKED",
                    "You have already marked attendance for this event",
                    null
            );
        }
        
        // 8. Save Attendance
        Attendance attendance = Attendance.builder()
                .prn(prn)
                .event(event)
                .userLatitude(request.getLatitude())
                .userLongitude(request.getLongitude())
                .distanceFromVenue(distance)
                .qrToken(request.getQrToken())
                .status(AttendanceStatus.PRESENT)
                .deviceInfo(request.getDeviceInfo())
                .ipAddress(httpRequest.getRemoteAddr())
                .build();
        
        attendanceRepository.save(attendance);
        
        log.info("✅ Attendance marked successfully for PRN {} in event {}", prn, eventId);
        
        AttendanceResponse response = AttendanceResponse.success(
                attendance.getAttendanceId(),
                eventId,
                prn,
                attendance.getMarkedAt(),
                distance
        );
        
        return ApiResponse.success("Attendance marked successfully", response);
    }
    
    /**
     * Stop attendance session
     */
    @Transactional
    public ApiResponse<String> stopAttendance(Long eventId, String prn, String role) {
        log.info("Stopping attendance for event {} by {}", eventId, prn);
        
        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with ID: " + eventId));
        
        // Authorization check
        if (!event.getEventCreator().equals(prn) && !"SUPER_ADMIN".equals(role)) {
            throw new UnauthorizedException("Only event creator or admin can stop attendance");
        }
        
        if (!event.isAttendanceActive()) {
            throw new InvalidOperationException("Attendance is not active");
        }
        
        event.stopAttendance();
        eventRepository.save(event);
        
        log.info("✅ Attendance stopped for event {}", eventId);
        return ApiResponse.success(
                "Attendance session stopped successfully",
                "Attendance is now closed for this event"
        );
    }
    
    /**
     * Get attendance list for an event
     */
    public ApiResponse<AttendanceListResponse> getAttendanceList(Long eventId) {
        log.info("Fetching attendance list for event {}", eventId);
        
        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with ID: " + eventId));
        
        // Get all enrollments
        Long totalEnrolled = enrollmentRepository.countByEvent(event);
        
        // Get all attendances
        List<Attendance> attendances = attendanceRepository.findByEvent(event);
        Integer totalPresent = attendances.size();
        Integer totalAbsent = totalEnrolled.intValue() - totalPresent;
        
        Double attendancePercentage = totalEnrolled > 0 
                ? (totalPresent * 100.0) / totalEnrolled 
                : 0.0;
        
        // Map to response
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        List<AttendanceListResponse.AttendanceRecord> records = attendances.stream()
                .map(a -> AttendanceListResponse.AttendanceRecord.builder()
                        .prn(a.getPrn())
                        .status(a.getStatus().name())
                        .markedAt(a.getMarkedAt().format(formatter))
                        .distanceFromVenue(a.getDistanceFromVenue())
                        .build())
                .collect(Collectors.toList());
        
        AttendanceListResponse response = AttendanceListResponse.builder()
                .eventId(eventId)
                .eventTitle(event.getTitle())
                .totalEnrolled(totalEnrolled.intValue())
                .totalPresent(totalPresent)
                .totalAbsent(totalAbsent)
                .attendancePercentage(Math.round(attendancePercentage * 100.0) / 100.0)
                .attendees(records)
                .build();
        
        return ApiResponse.success(
                String.format("Fetched attendance for %d students", totalPresent),
                response
        );
    }
    
    /**
     * Get my attendance records (student view)
     */
    public ApiResponse<List<AttendanceResponse>> getMyAttendance(String prn) {
        log.info("Fetching attendance records for PRN {}", prn);
        
        List<Attendance> attendances = attendanceRepository.findByPrn(prn);
        
        List<AttendanceResponse> responses = attendances.stream()
                .map(a -> AttendanceResponse.builder()
                        .attendanceId(a.getAttendanceId())
                        .eventId(a.getEvent().getEventId())
                        .prn(a.getPrn())
                        .status(a.getStatus())
                        .markedAt(a.getMarkedAt())
                        .distanceFromVenue(a.getDistanceFromVenue())
                        .success(true)
                        .build())
                .collect(Collectors.toList());
        
        return ApiResponse.success(
                String.format("Fetched %d attendance records", responses.size()),
                responses
        );
    }
    
    /**
     * Check attendance status for a specific event (for student)
     */
    public ApiResponse<AttendanceResponse> checkMyAttendanceStatus(Long eventId, String prn) {
        log.info("Checking attendance status for PRN {} in event {}", prn, eventId);
        
        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with ID: " + eventId));
        
        Attendance attendance = attendanceRepository.findByEventAndPrn(event, prn)
                .orElse(null);
        
        if (attendance == null) {
            AttendanceResponse response = AttendanceResponse.builder()
                    .success(false)
                    .eventId(eventId)
                    .prn(prn)
                    .message("Attendance not marked yet")
                    .build();
            return ApiResponse.success("Attendance not marked", response);
        }
        
        AttendanceResponse response = AttendanceResponse.builder()
                .success(true)
                .attendanceId(attendance.getAttendanceId())
                .eventId(eventId)
                .prn(prn)
                .status(attendance.getStatus())
                .markedAt(attendance.getMarkedAt())
                .distanceFromVenue(attendance.getDistanceFromVenue())
                .message("Attendance marked")
                .build();
        
        return ApiResponse.success("Attendance status fetched", response);
    }
}