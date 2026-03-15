package com.clubHouse.event_service2.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RatingRequest implements Serializable {

    @NotNull(message = "Event Id is required")
    private Long eventId;

    @NotNull(message = "Rating should be in between 1 to 5")
    @Min(value = 1, message = "Rating should be min 1")
    @Max(value = 5, message = "Rating should be max 5")
    private Integer rating;

}
