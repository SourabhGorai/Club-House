package com.clubHouse.event_service2.repository;

import com.clubHouse.event_service2.model.EventEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventEnrollmentService extends JpaRepository<EventEnrollment, Long> {

    List<EventEnrollment> findByEvent_EventId(Long eventId);

    List<EventEnrollment> findByPrn(String prn);

    boolean existsByEvent_EventIdAndPrn(Long eventId, String prn);

}
