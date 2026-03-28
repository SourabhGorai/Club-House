package com.clubHouse.tnp.repository;

import com.clubHouse.tnp.model.Tnp;
import com.clubHouse.tnp.model.TnpRoles;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TnpRepository extends JpaRepository<Tnp, Long> {

    Tnp findByPrn(String prn);
    List<Tnp> findAllByIsActiveTrue();
    List<Tnp> findAllByIsActiveFalse();
    Page<Tnp> findAllByIsActiveTrue(Pageable pageable);
    List<Tnp> findByRoleAndIsActiveTrue(TnpRoles role);
    List<Tnp> findAllByIsActiveTrueAndEndDateBefore(LocalDateTime dateTime);

    Optional<Tnp> findByPrnAndRoleAndStartDateAndEndDate(
            String prn, TnpRoles role,
            LocalDateTime startDate, LocalDateTime endDate
    );

    List<Tnp> findAllByIsActiveFalseAndEndDateBefore(LocalDateTime oneYearAgo);

    Tnp findByPrnAndIsActiveTrue(String prn);
}
