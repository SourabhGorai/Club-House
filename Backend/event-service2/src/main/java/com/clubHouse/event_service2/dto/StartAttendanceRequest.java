package com.clubHouse.event_service2.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartAttendanceRequest {
    
    @NotNull(message = "Latitude is required")
    private Double latitude;
    
    @NotNull(message = "Longitude is required")
    private Double longitude;
    
    private Integer radiusInMeters = 50; // Default 50m
    
    @NotNull(message = "Attendance window start time is required")
    private LocalDateTime attendanceWindowStart;
    
    @NotNull(message = "Attendance window end time is required")
    private LocalDateTime attendanceWindowEnd;
}