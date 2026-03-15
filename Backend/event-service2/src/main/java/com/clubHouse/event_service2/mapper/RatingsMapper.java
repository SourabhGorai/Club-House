package com.clubHouse.event_service2.mapper;

import com.clubHouse.event_service2.dto.response.RatingResponse;
import com.clubHouse.event_service2.model.Events;
import com.clubHouse.event_service2.model.Ratings;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class RatingsMapper {

    public static RatingResponse toResponse(Ratings rating){
        if(rating == null){
            return null;
        }

        return RatingResponse.builder()
                .ratingId(rating.getRatingId())
                .eventId(rating.getEvent().getEventId())
                .eventTitle(rating.getEvent().getTitle())
                .overallRatings(rating.getCount() == 0
                        ? 0.0
                        : (double) rating.getRatingSum() / rating.getCount())
                .build();
    }

    public static List<RatingResponse> toResponseList(List<Ratings> ratings) {
        if(ratings.isEmpty()){
            return List.of();
        }

        return ratings.stream()
                .map(RatingsMapper::toResponse)
                .collect(Collectors.toList());
    }
}
