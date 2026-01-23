package com.clubHouse.event_service2.dto;

import com.clubHouse.event_service2.model.TargetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EventRequest {

    private String title;

    private String description;

    private String speakerName;

    private LocalDateTime eventDate;

    private String organizer;

    private String venue;

    private TargetType target;

}
