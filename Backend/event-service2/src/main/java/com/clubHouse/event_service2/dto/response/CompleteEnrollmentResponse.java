package com.clubHouse.event_service2.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@JsonInclude
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompleteEnrollmentResponse {

    private Long enrollmentId;
    private String prn;
    private Long eventId;
    private String createdAt;

    private String name;
    private String year;
    private String department;

}
