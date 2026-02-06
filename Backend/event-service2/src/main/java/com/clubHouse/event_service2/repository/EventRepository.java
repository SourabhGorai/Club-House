package com.clubHouse.event_service2.repository;

import com.clubHouse.event_service2.model.Events;
import com.clubHouse.event_service2.model.TargetType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Events, Long> {
    List<Events> findByOrganizer(String prn);

    List<Events> findByEventCreator(String prn);

    List<Events> findByTarget(TargetType targetType);

    List<Events> findByIsCompleted(boolean status);

    List<Events> findByEnrollmentDeadline(String sanitizedStatus);

    List<Long> findEventIdsByEventCreator(String prn);

    int deleteByEventIdIn(List<Long> eventIds);

    List<Long> findEventIdsCreatedBefore(LocalDateTime threeYearsAgo);
}
