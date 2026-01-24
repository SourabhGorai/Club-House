package com.clubHouse.event_service2.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Ratings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ratingId;

    @NotNull(message = "Event Id required")
    private Long eventId;

    private Long ratingSum;

    private Long count;

    @Min(value = 1, message = "Rating lies in the range of 1 to 5")
    @Max(value = 5, message = "Rating lies in the range of 1 to 5")
    private Long ratings;

}
