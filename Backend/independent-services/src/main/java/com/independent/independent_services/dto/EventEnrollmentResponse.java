package com.independent.independent_services.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EventEnrollmentResponse {

    private String enrollmentId;
//    private Even

}
