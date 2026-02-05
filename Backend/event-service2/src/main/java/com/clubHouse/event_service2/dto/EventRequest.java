package com.clubHouse.event_service2.dto;

import com.clubHouse.event_service2.model.TargetType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EventRequest {

    @NotNull(message = "Event title required")
    private String title;

    @NotNull(message = "Event description required")
    private String description;

    private String speakerName;

    private LocalDateTime eventDate;

    @NotNull(message = "Event title required")
    private String organizer = null;

    private String venue;

    @NotNull(message = "Target type is required")
    private TargetType target;

    private List<Long> targetIds;

    private LocalDateTime enrollmentDeadline;

}
