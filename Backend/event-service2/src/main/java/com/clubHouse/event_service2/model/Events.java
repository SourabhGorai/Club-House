package com.clubHouse.event_service2.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Events {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long eventId;

    @NotNull(message = "Title is required")
    private String title;

    private String description;

    private String speakerName;

    @NotNull(message = "Event Date is required")
    private LocalDateTime eventDate;

    private String organizer;   // department, club, etc

    private String eventCreator;

    private String venue;

    @Enumerated(EnumType.STRING)
    private TargetType target;

}

