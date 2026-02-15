package com.clubHouse.event_service2.dto;

import com.clubHouse.event_service2.model.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponse {
    
    private Long attendanceId;
    private Long eventId;
    private String prn;
    private AttendanceStatus status;
    private LocalDateTime markedAt;
    private Double distanceFromVenue;
    
    // For error responses
    private boolean success;
    private String message;
    private String errorCode;
    
    public static AttendanceResponse success(Long attendanceId, Long eventId, 
                                            String prn, LocalDateTime markedAt, 
                                            Double distance) {
        return AttendanceResponse.builder()
                .success(true)
                .attendanceId(attendanceId)
                .eventId(eventId)
                .prn(prn)
                .status(AttendanceStatus.PRESENT)
                .markedAt(markedAt)
                .distanceFromVenue(distance)
                .message("Attendance marked successfully")
                .build();
    }
    
    public static AttendanceResponse error(String errorCode, String message) {
        return AttendanceResponse.builder()
                .success(false)
                .errorCode(errorCode)
                .message(message)
                .build();
    }
}