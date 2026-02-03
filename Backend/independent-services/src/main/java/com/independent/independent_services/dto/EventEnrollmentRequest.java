package com.independent.independent_services.dto;

import com.independent.independent_services.model.EventEnrollment;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventEnrollmentRequest {

    @NotNull(message = "PRN is required")
    private String prn;

    @NotNull(message = "Event Id is required")
    private Long eventId;

    @NotNull(message = "Date Time is required")
    private LocalDateTime dateTime;

}
