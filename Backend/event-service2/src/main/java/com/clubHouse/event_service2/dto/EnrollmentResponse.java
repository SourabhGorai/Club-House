package com.clubHouse.event_service2.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

import java.time.LocalDateTime;

@JsonInclude
@Builder
public class EnrollmentResponse {

    private Long enrollmentId;
    private String prn;
    private Long eventId;    // it should be a redirect link to the event
    private LocalDateTime createdAt;

}
