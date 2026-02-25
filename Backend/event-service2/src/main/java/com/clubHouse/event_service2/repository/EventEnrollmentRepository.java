package com.clubHouse.event_service2.repository;

import com.clubHouse.event_service2.model.EventEnrollment;
import com.clubHouse.event_service2.model.Events;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventEnrollmentRepository extends JpaRepository<EventEnrollment, Long> {

    List<EventEnrollment> findByEvent_EventId(Long eventId);

    List<EventEnrollment> findByPrn(String prn);

    boolean existsByEvent_EventIdAndPrn(Long eventId, String prn);

    Optional<EventEnrollment> findByEvent_EventIdAndPrn(Long eventId, String prn);

    void deleteByPrnAndEvent_EventId(String prn, Long eventId);

    void deleteByEvent_EventId(Long eventId);

    int deleteByPrn(String prn);

    int deleteByEvent_EventIdIn(List<Long> eventIds);

    Long countByEvent(Events event);

    boolean existsByEventAndPrn(Events event, String prn);
}
