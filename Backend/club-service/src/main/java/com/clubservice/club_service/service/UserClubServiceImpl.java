package com.clubservice.club_service.service;

import com.clubservice.club_service.dto.UserClubRequestDTO;
import com.clubservice.club_service.dto.UserClubResponseDTO;
import com.clubservice.club_service.exception.NotFoundException;
import com.clubservice.club_service.mapper.ClubMapper;
import com.clubservice.club_service.model.ClubCreation;
import com.clubservice.club_service.model.UserClub;
import com.clubservice.club_service.repository.ClubRepository;
import com.clubservice.club_service.repository.UserClubRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserClubServiceImpl implements UserClubService {

    private final UserClubRepository userClubRepository;
    private final ClubRepository clubCreationRepository;

    @Override
    public UserClubResponseDTO addUserToClub(UserClubRequestDTO dto) {

        ClubCreation club = clubCreationRepository.findById(dto.getClubId())
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + dto.getClubId()));

        UserClub userClub = UserClub.builder()
                .prn(dto.getPrn())
                .club(club)
                .role(dto.getRole())
                .tenure(dto.getTenure())
                .build();

        UserClub saved = userClubRepository.save(userClub);

        return ClubMapper.toResponse(saved);
    }

    @Override
    public List<UserClubResponseDTO> getClubsOfUser(String prn) {
        return userClubRepository.findByPrn(prn)
                .stream()
                .map(ClubMapper::toResponse)
                .toList();
    }

    @Override
    public List<UserClubResponseDTO> getAllUserClubMappings() {
        return userClubRepository.findAll()
                .stream()
                .map(ClubMapper::toResponse)
                .toList();
    }

    @Override
    public List<UserClubResponseDTO> getUsersByClubName(String clubName) {

        clubName = ClubMapper.sanitize(clubName);
        List<UserClub> list = userClubRepository.findByClub_ClubName(clubName);

        if (list.isEmpty()) {
            throw new NotFoundException("No users found for club: " + clubName);
        }

        return list.stream()
                .map(ClubMapper::toResponse)
                .toList();
    }


    @Override
    public void deleteUserFromClub(String prn, String clubName) {

        String sanitizedClubName = ClubMapper.sanitize(clubName);

        UserClub userClub = userClubRepository
                .findByPrnAndClub_ClubName(prn, sanitizedClubName)
                .orElseThrow(() ->
                        new RuntimeException("No user-club mapping found for PRN: "
                                + prn + " and club: " + sanitizedClubName));

        userClubRepository.delete(userClub);
    }
}
