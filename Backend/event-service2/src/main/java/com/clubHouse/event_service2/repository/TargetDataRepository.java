package com.clubHouse.event_service2.repository;

import com.clubHouse.event_service2.model.TargetData;
import com.clubHouse.event_service2.model.TargetType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TargetDataRepository extends JpaRepository<TargetData, Long> {

    List<TargetData> findByTargetTypeAndTargetId(TargetType targetType, Long targetId);

    void deleteByEvents_EventId(Long eventId);

    int deleteByEvents_EventIdIn(List<Long> eventIds);

    // Fetch all target data for a single event
    List<TargetData> findByEvents_EventId(Long eventId);

    // Fetch all target data for multiple events (used in batch toList)
    List<TargetData> findByEvents_EventIdIn(List<Long> eventIds);
}
