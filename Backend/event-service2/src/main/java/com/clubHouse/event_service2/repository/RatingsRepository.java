package com.clubHouse.event_service2.repository;

import com.clubHouse.event_service2.model.Ratings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RatingsRepository extends JpaRepository<Ratings, Long> {

    @Query("""
                SELECT r.eventId
                FROM Ratings r
                WHERE r.count > 0
                AND (1.0 * r.ratingSum / r.count) >= :rating
            """)
    List<Long> findEventIdsByMinRating(@Param("rating") double rating);


}
