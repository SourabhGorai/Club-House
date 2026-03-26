package com.clubHouse.tnp.repository;

import com.clubHouse.tnp.model.VisitYear;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VisitYearRepository extends JpaRepository<VisitYear, Long> {
//    Optional<VisitYear> findByYear(Integer year);

    Optional<VisitYear> findByAcademicSession(String academicSession);
}