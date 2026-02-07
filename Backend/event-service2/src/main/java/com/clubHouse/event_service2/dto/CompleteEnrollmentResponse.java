package com.clubHouse.event_service2.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

@Builder
@JsonInclude
@Data
public class CompleteEnrollmentResponse {

    private Long enrollmentId;
    private String prn;
    private Long eventId;
    private String createdAt;

    private String name;
    private String year;
    private String department;

}
