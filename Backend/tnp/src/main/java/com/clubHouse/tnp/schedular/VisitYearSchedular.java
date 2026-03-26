package com.clubHouse.tnp.schedular;

import com.clubHouse.tnp.model.VisitYear;
import com.clubHouse.tnp.repository.VisitYearRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class VisitYearSchedular {

    private final VisitYearRepository visitYearRepository;

    /**
     * Runs every year on June 1st at 00:00
     */
    @Scheduled(cron = "0 0 0 1 6 *")
    public void createAcademicSession() {

        int currentYear = LocalDate.now().getYear();
        String academicSession = VisitYear.generateAcademicSession(currentYear);

        log.info("Running scheduler for academic session: {}", academicSession);

        // Prevent duplicate entry
        boolean exists = visitYearRepository
                .findByAcademicSession(academicSession)
                .isPresent();

        if (exists) {
            log.info("Academic session already exists: {}", academicSession);
            return;
        }

        VisitYear visitYear = VisitYear.builder()
                .academicSession(academicSession)
                .build();

        visitYearRepository.save(visitYear);

        log.info("Academic session created successfully: {}", academicSession);
    }

}
