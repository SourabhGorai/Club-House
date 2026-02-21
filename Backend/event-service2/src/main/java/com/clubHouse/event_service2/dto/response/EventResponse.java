package com.clubHouse.event_service2.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
@Data
public class EventResponse {

    private Long eventId;

    private String title;

    private String description;

    private String day;

    private LocalDateTime dateTime;

    private String organizer;

    private String creatorPrn;

    private String creatorName;

    private String speakerName;

    private String venue;

    private Integer maxEnrollments;

    private int currEnrollments;

    private boolean isCompleted;

    private LocalDateTime enrollmentDeadline;

    private String enrollmentStatus;

    private String targetType;

    private List<Long> targetIds;

    private Double latitude;
    private Double longitude;
    private Integer radiusInMeters;

    private LocalDateTime attendanceWindowStart;
    private LocalDateTime attendanceWindowEnd;

    private int qrRefreshInterval;

}