package com.clubHouse.event_service2.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Builder
@JsonInclude
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompleteEnrollmentResponse implements Serializable {

    private Long enrollmentId;
    private String prn;
    private Long eventId;
    private String createdAt;

    private String name;
    private String year;
    private String department;

}
