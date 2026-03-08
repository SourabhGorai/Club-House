package com.clubHouse.event_service2.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.io.Serializable;

@NoArgsConstructor
@AllArgsConstructor
@JsonInclude
@Builder
@Data
public class EnrollmentResponse implements Serializable {

    private Long enrollmentId;
    private String prn;
    private Long eventId;    // it should be a redirect link to the event
    private String createdAt;

}
