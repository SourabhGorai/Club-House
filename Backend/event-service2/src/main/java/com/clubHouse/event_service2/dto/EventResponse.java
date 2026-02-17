package com.clubHouse.event_service2.dto;

import com.clubHouse.event_service2.model.TargetType;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
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

    private String dateTime;

    private String organizer;

    private String creatorPrn;

    private String creatorName;

    private String venue;

    private Integer maxEnrollments;

    private int currEnrollments;

    private boolean isCompleted;

    private LocalDateTime enrollmentDeadline;

    private String enrollmentStatus;

}