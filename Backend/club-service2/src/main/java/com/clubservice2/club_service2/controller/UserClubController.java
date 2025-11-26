package com.clubservice2.club_service2.controller;

import com.clubservice2.club_service2.dto.*;
import com.clubservice2.club_service2.service.UserClubService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/user-clubs")
@RequiredArgsConstructor
@Validated
public class UserClubController {

    private final UserClubService userClubService;

    /**
     * Adds a user to a club
     * POST /api/user-clubs
     */
    @PostMapping
    public ResponseEntity<ApiResponse<UserClubResponse>> addUserToClub(
            @Valid @RequestBody UserClubRequest request) {

        log.info("Request received to add user {} to club {}",
                request.getPrn(), request.getClubId());

        UserClubResponse response = userClubService.addUserToClub(request);

        log.info("User {} added to club {} successfully",
                request.getPrn(), response.getClubName());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("User added to club successfully", response));
    }

    /**
     * Retrieves all clubs for a specific user with profile details
     * GET /api/user-clubs/user/{prn}
     */
    @GetMapping("/user/{prn}")
    public ResponseEntity<ApiResponse<List<ProfileEnrichedUserClubResponse>>> getUserClubs(
            @PathVariable @NotBlank(message = "PRN is required") String prn) {

        log.debug("Request received to fetch clubs for user: {}", prn);
        List<ProfileEnrichedUserClubResponse> clubs = userClubService.getUserClubs(prn);

        return ResponseEntity.ok(
                ApiResponse.success(
                        String.format("Retrieved %d club associations with profile details for user %s",
                                clubs.size(), prn),
                        clubs
                )
        );
    }

    /**
     * Retrieves all user-club associations with profile details
     * GET /api/user-clubs
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProfileEnrichedUserClubResponse>>> getAllUserClubAssociations() {
        log.debug("Request received to fetch all user-club associations");
        List<ProfileEnrichedUserClubResponse> associations = userClubService.getAllUserClubAssociations();

        return ResponseEntity.ok(
                ApiResponse.success(
                        String.format("Retrieved %d user-club associations with profile details",
                                associations.size()),
                        associations
                )
        );
    }

    /**
     * Retrieves all members of a specific club with profile details
     * GET /api/user-clubs/club/{clubName}
     */
    @GetMapping("/club/{clubName}")
    public ResponseEntity<ApiResponse<List<ProfileEnrichedUserClubResponse>>> getClubMembers(
            @PathVariable @NotBlank(message = "Club name is required") String clubName) {

        log.debug("Request received to fetch members of club: {}", clubName);
        List<ProfileEnrichedUserClubResponse> members = userClubService.getClubMembers(clubName);

        return ResponseEntity.ok(
                ApiResponse.success(
                        String.format("Retrieved %d members with profile details for club %s",
                                members.size(), clubName),
                        members
                )
        );
    }

    /**
     * Retrieves all PRNs for a club (without profile enrichment)
     * GET /api/user-clubs/club/{clubName}/prns
     */
    @GetMapping("/club/{clubName}/prns")
    public ResponseEntity<ApiResponse<ClubPrnsResponse>> getClubPrns(
            @PathVariable @NotBlank(message = "Club name is required") String clubName) {

        log.debug("Request received to fetch PRNs for club: {}", clubName);
        ClubPrnsResponse response = userClubService.getClubPrns(clubName);

        return ResponseEntity.ok(
                ApiResponse.success(
                        String.format("Retrieved %d PRNs for club %s",
                                response.getTotalCount(), clubName),
                        response
                )
        );
    }

    /**
     * Retrieves club members filtered by academic year with profile details
     * GET /api/user-clubs/club/{clubName}/year/{year}
     */
    @GetMapping("/club/{clubName}/year/{year}")
    public ResponseEntity<ApiResponse<List<ProfileEnrichedUserClubResponse>>> getClubMembersByYear(
            @PathVariable @NotBlank(message = "Club name is required") String clubName,
            @PathVariable @NotNull(message = "Year is required") Integer year) {

        log.debug("Request received to fetch members for club {} filtered by year {}",
                clubName, year);

        List<ProfileEnrichedUserClubResponse> members = userClubService.getClubMembersByYear(clubName, year);

        return ResponseEntity.ok(
                ApiResponse.success(
                        String.format("Retrieved %d members with profile details for club %s in year %d",
                                members.size(), clubName, year),
                        members
                )
        );
    }

    /**
     * Removes a user from a club
     * DELETE /api/user-clubs/user/{prn}/club/{clubName}
     */
    @DeleteMapping("/user/{prn}/club/{clubName}")
    public ResponseEntity<ApiResponse<Void>> removeUserFromClub(
            @PathVariable @NotBlank(message = "PRN is required") String prn,
            @PathVariable @NotBlank(message = "Club name is required") String clubName) {

        log.info("Request received to remove user {} from club {}", prn, clubName);
        userClubService.removeUserFromClub(prn, clubName);
        log.info("User {} removed from club {} successfully", prn, clubName);

        return ResponseEntity.ok(
                ApiResponse.success("User removed from club successfully")
        );
    }
}