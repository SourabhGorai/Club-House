package com.clubHouse.event_service2.repository;

import com.clubHouse.event_service2.model.Events;
import com.clubHouse.event_service2.model.Ratings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RatingsRepository extends JpaRepository<Ratings, Long> {

    @Query("""
                SELECT r.event.eventId
                FROM Ratings r
                WHERE r.count > 0
                AND (1.0 * r.ratingSum / r.count) >= :rating
            """)
    List<Long> findEventIdsByMinRating(@Param("rating") double rating);

//    void deleteByEvent(Events event);

    int deleteByEvent_EventIdIn(List<Long> eventIds);

    Ratings findByEvent(Events event);

    Ratings findByEvent_EventId(Long eventId);

    List<Ratings> findByEvent_EventIdIn(List<Long> eventIds);

    void deleteByEvent_EventId(Long eventId);
}
