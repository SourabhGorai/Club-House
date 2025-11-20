package com.clubservice.club_service.controller;

import com.clubservice.club_service.dto.UserClubRequestDTO;
import com.clubservice.club_service.dto.UserClubResponseDTO;
import com.clubservice.club_service.exception.UserNotFoundException;
import com.clubservice.club_service.mapper.ApiResponse;
import com.clubservice.club_service.service.UserClubService;
import com.clubservice.club_service.service.UserValidationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-club")
@RequiredArgsConstructor
@Slf4j
public class UserClubController {

    private final UserClubService userClubService;
    private final UserValidationService userValidationService;

    @PostMapping
    public ResponseEntity<ApiResponse<UserClubResponseDTO>> addUserToClub(
            @RequestBody UserClubRequestDTO dto) {

        boolean isValidUser = userValidationService.validateUser(dto.getPrn());
        if (!isValidUser) {
            throw new UserNotFoundException("No user registered with PRN: " + dto.getPrn());
        }


        UserClubResponseDTO created = userClubService.addUserToClub(dto);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User added to club successfully", created));
    }

    @GetMapping("/{prn}")
    public ResponseEntity<ApiResponse<List<UserClubResponseDTO>>> getClubsOfUser(
            @PathVariable String prn) {

        boolean isValidUser = userValidationService.validateUser(prn);
        if (!isValidUser) {
            throw new UserNotFoundException("No user registered with PRN: " + prn);
        }

        List<UserClubResponseDTO> list = userClubService.getClubsOfUser(prn);

        return ResponseEntity.ok(
                ApiResponse.success("Fetched user club associations", list)
        );
    }

    @DeleteMapping("/{prn}/{clubName}")
    public ResponseEntity<ApiResponse<Void>> deleteUserFromClub(
            @PathVariable String prn,
            @PathVariable String clubName) {

        boolean isValidUser = userValidationService.validateUser(prn);
        if (!isValidUser) {
            throw new UserNotFoundException("No user registered with PRN: " + prn);
        }

        userClubService.deleteUserFromClub(prn, clubName);

        return ResponseEntity.ok(
                ApiResponse.success("User removed from club successfully", null)
        );
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<UserClubResponseDTO>>> getAllUserClubMappings() {

        List<UserClubResponseDTO> list = userClubService.getAllUserClubMappings();

        return ResponseEntity.ok(
                ApiResponse.success("Fetched all user-club associations", list)
        );
    }

    @GetMapping("/club/{clubName}")
    public ResponseEntity<ApiResponse<List<UserClubResponseDTO>>> getUsersByClubName(
            @PathVariable String clubName) {

        List<UserClubResponseDTO> list = userClubService.getUsersByClubName(clubName);

        return ResponseEntity.ok(
                ApiResponse.success("Fetched users belonging to club: " + clubName, list)
        );
    }

}
