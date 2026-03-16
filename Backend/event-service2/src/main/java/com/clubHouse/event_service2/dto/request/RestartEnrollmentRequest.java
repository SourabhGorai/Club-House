package com.clubHouse.event_service2.dto.request;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RestartEnrollmentRequest implements Serializable {

    private Long eventId;
    private LocalDateTime enrollmentDeadline;

}
