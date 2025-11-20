package com.clubservice.club_service.service;

import com.clubservice.club_service.dto.ClubResponseDTO;
import com.clubservice.club_service.dto.publicClubView;
import com.clubservice.club_service.exception.ClubAlreadyExistsException;
import com.clubservice.club_service.exception.ClubNotFoundException;
import com.clubservice.club_service.exception.ClubOperationException;
import com.clubservice.club_service.mapper.ClubMapper;
import com.clubservice.club_service.model.ClubCreation;
import com.clubservice.club_service.repository.ClubRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class ClubService {

    private final ClubRepository clubRepository;

    public ClubResponseDTO addClub(String clubName) {

        log.info("Creating Club: {}", clubName);

        clubName = ClubMapper.sanitize(clubName);

        if (clubRepository.existsByClubNameAndIsActiveTrue(clubName)) {
            throw new ClubAlreadyExistsException(
                    "Club with name '" + clubName + "' already exists"
            );
        } else if (clubRepository.existsByClubNameAndIsActiveFalse(clubName)){
            ClubCreation club = clubRepository.findByClubNameAndIsActiveFalse(clubName);
            club.setIsActive(true);
            club.setCreatedAt(LocalDateTime.now());
            ClubCreation savedClub = clubRepository.save(club);
            return ClubMapper.toClubResponse(savedClub);
        }

        ClubCreation club = new ClubCreation();
        club.setClubName(clubName);

        ClubCreation savedClub = clubRepository.save(club);

        return ClubMapper.toClubResponse(savedClub);
    }

    public void deleteClub(String clubName) {
        log.info("Soft deleting club: {}", clubName);

        String sanitizedName = ClubMapper.sanitize(clubName);

        ClubCreation club = clubRepository.findByClubNameAndIsActiveTrue(sanitizedName)
                .orElseThrow(() -> {
                    log.error("Club not found with name: {}", sanitizedName);
                    return new ClubNotFoundException("Club not found with name: " + sanitizedName);
                });

        try {
            club.setIsActive(false);
            club.setDeletedAt(LocalDateTime.now());
            clubRepository.save(club);

            log.info("Club soft deleted successfully: {}", sanitizedName);

        } catch (Exception ex) {
            log.error("Error deleting club '{}': {}", sanitizedName, ex.getMessage(), ex);
            throw new ClubOperationException("Failed to delete club: " + sanitizedName, ex);
        }
    }

    public List<ClubResponseDTO> getAll() {
        log.debug("Fetching all active clubs");
        List<ClubCreation> list = clubRepository.findAll();
        log.info("Found all active clubs with size: {}", list.size());
        return ClubMapper.toClubResponseList(list);
    }

    public List<publicClubView> getAllPublic() {
        log.debug("Fetching all active clubs in public view");
        List<ClubCreation> list = clubRepository.findAll();
        log.info("Found all active clubs with size: {}", list.size());
        return ClubMapper.toPublicClubViewList(list);
    }
}
