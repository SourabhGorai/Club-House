package com.clubHouse.event_service2.repository;

import com.clubHouse.event_service2.model.Events;
import com.clubHouse.event_service2.model.TargetType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Events, Long> {
    List<Events> findByOrganizer(String prn);

    List<Events> findByEventCreator(String prn);

    List<Events> findByTarget(TargetType targetType);
}
