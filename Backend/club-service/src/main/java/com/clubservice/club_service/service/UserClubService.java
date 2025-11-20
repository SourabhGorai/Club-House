package com.clubservice.club_service.service;

import com.clubservice.club_service.dto.UserClubRequestDTO;
import com.clubservice.club_service.dto.UserClubResponseDTO;

import java.util.List;

public interface UserClubService {

    UserClubResponseDTO addUserToClub(UserClubRequestDTO dto);

    List<UserClubResponseDTO> getClubsOfUser(String prn);

    List<UserClubResponseDTO> getAllUserClubMappings();

    List<UserClubResponseDTO> getUsersByClubName(String clubName);

    void deleteUserFromClub(String prn, String clubName);
}
