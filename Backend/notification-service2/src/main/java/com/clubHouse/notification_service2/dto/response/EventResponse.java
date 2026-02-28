package com.clubHouse.notification_service2.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

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

    private String dateTime;

    private String organizer;

    private String creatorPrn;

    private String creatorName;

    private String speakerName;

    private String venue;

    private Integer maxEnrollments;

    private int currEnrollments;

    private boolean completed;

    private LocalDateTime enrollmentDeadline;

    private String enrollmentStatus;

    private String targetType = "GLOBAL";

    private List<Long> targetIds;

    private Double latitude;
    private Double longitude;
    private Integer radiusInMeters;

    private LocalDateTime attendanceWindowStart;
    private LocalDateTime attendanceWindowEnd;

    private int qrRefreshInterval;

}