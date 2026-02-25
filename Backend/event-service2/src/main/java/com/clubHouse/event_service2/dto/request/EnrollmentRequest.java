package com.clubHouse.event_service2.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EnrollmentRequest {

    @NotNull(message = "PRN is required")
    private String prn;

    @NotNull(message = "Event Id is required")
    private Long eventId;

}
