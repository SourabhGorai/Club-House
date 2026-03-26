package com.clubHouse.tnp.schedular;

import com.clubHouse.tnp.repository.TnpRepository;
import com.clubHouse.tnp.model.Tnp;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CleanupSchedular {

    private final TnpRepository tnpRepository;

    // ── Runs every day at midnight ────────────────────────────────────────────────

    /**
     * Marks isActive = false for all members whose endDate has passed.
     * Runs daily at midnight.
     */
    @Transactional
    @Scheduled(cron = "0 0 0 * * *")
    public void deactivateExpiredMembers() {

        log.info("Scheduler triggered: checking for expired TNP memberships");

        List<Tnp> expiredMembers = tnpRepository
                .findAllByIsActiveTrueAndEndDateBefore(LocalDateTime.now());

        if (expiredMembers.isEmpty()) {
            log.info("No expired TNP memberships found");
            return;
        }

        expiredMembers.forEach(Tnp::Deactivate);
        tnpRepository.saveAll(expiredMembers);

        log.info("Deactivated {} expired TNP memberships", expiredMembers.size());
    }

    /**
     * Permanently deletes members who have been inactive for more than 1 year.
     * Runs every day at 1:00 AM to avoid overlap with deactivation job above.
     */
    @Transactional
    @Scheduled(cron = "0 0 1 * * *")
    public void deleteStaleInactiveMembers() {

        log.info("Scheduler triggered: checking for stale inactive TNP members");

        LocalDateTime oneYearAgo = LocalDateTime.now().minusYears(1);

        List<Tnp> staleMembers = tnpRepository
                .findAllByIsActiveFalseAndEndDateBefore(oneYearAgo);

        if (staleMembers.isEmpty()) {
            log.info("No stale inactive TNP members found");
            return;
        }

        tnpRepository.deleteAll(staleMembers);

        log.info("Permanently deleted {} stale inactive TNP members", staleMembers.size());
    }
}