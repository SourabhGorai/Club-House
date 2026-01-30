package com.clubHouse.event_service2.repository;

import com.clubHouse.event_service2.model.TargetData;
import com.clubHouse.event_service2.model.TargetType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TargetDataRepository extends JpaRepository<TargetData, Long> {

    List<TargetData> findByTargetTypeAndTargetId(TargetType targetType, Long targetId);

}
