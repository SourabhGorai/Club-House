package com.clubHouse.event_service2.repository;

import com.clubHouse.event_service2.model.Attendance;
import com.clubHouse.event_service2.model.Events;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    Optional<Attendance> findByEventAndPrn(Events event, String prn);
    
    List<Attendance> findByEvent(Events event);
    
    List<Attendance> findByPrn(String prn);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.event = :event")
    Long countByEvent(Events event);
    
    boolean existsByEventAndPrn(Events event, String prn);
}