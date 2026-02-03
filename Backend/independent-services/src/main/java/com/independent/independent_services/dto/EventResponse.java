package com.independent.independent_services.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
public class EventResponse {

    private Long eventId;

    private String title;

    private String description;

    private String day;

    private String dateTime;

    private String organizer;

    private String creatorPrn;

    private String creatorName;

    private String venue;

    private boolean isCompleted;

}