package com.clubHouse.event_service2.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEventRequest {

    // Basic info
    private String title;
    private String description;
    private String speakerName;
    private String venue;
    private String organizer;

    // Scheduling
    private LocalDateTime eventDate;
    private LocalDateTime enrollmentDeadline;

    // Enrollment
    private Integer maxEnrollments;

    // Location & attendance window
    private Double latitude;
    private Double longitude;
    private Integer radiusInMeters;
    private LocalDateTime attendanceWindowStart;
    private LocalDateTime attendanceWindowEnd;

    // QR settings
    private Integer qrRefreshInterval;
}