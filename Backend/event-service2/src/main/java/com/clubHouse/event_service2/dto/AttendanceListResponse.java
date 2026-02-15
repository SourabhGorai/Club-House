package com.clubHouse.event_service2.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceListResponse {
    
    private Long eventId;
    private String eventTitle;
    private Integer totalEnrolled;
    private Integer totalPresent;
    private Integer totalAbsent;
    private Double attendancePercentage;
    private List<AttendanceRecord> attendees;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceRecord {
        private String prn;
        private String status;
        private String markedAt;
        private Double distanceFromVenue;
    }
}