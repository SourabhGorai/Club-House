package com.clubservice2.club_service2.controller;

import com.clubservice2.club_service2.dto.ApiResponse;
import com.clubservice2.club_service2.dto.ClubResponse;
import com.clubservice2.club_service2.dto.ClubSummaryResponse;
import com.clubservice2.club_service2.service.ClubService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/clubs")
@RequiredArgsConstructor
@Validated
public class ClubController {

    private final ClubService clubService;

    /**
     * Creates a new club
     * POST /api/clubs?name=Tech Club
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ClubResponse>> createClub(
            @RequestParam @NotBlank(message = "Club name is required") String name) {

        log.info("Request received to create club: {}", name);
        ClubResponse response = clubService.createClub(name);
        log.info("Club created successfully: {}", response.getClubName());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Club created successfully", response));
    }

    /**
     * Retrieves all clubs (including inactive)
     * GET /api/clubs
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ClubResponse>>> getAllClubs() {
        log.debug("Request received to fetch all clubs");
        List<ClubResponse> clubs = clubService.getAllClubs();

        return ResponseEntity.ok(
                ApiResponse.success(
                        String.format("Retrieved %d clubs", clubs.size()),
                        clubs
                )
        );
    }

    /**
     * Retrieves only active clubs
     * GET /api/clubs/active
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ClubResponse>>> getActiveClubs() {
        log.debug("Request received to fetch active clubs");
        List<ClubResponse> clubs = clubService.getActiveClubs();

        return ResponseEntity.ok(
                ApiResponse.success(
                        String.format("Retrieved %d active clubs", clubs.size()),
                        clubs
                )
        );
    }

    /**
     * Retrieves public club summaries (minimal information)
     * GET /api/clubs/public
     */
    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<ClubSummaryResponse>>> getPublicClubs() {
        log.debug("Request received to fetch public club summaries");
        List<ClubSummaryResponse> clubs = clubService.getPublicClubSummaries();

        return ResponseEntity.ok(
                ApiResponse.success(
                        String.format("Retrieved %d clubs", clubs.size()),
                        clubs
                )
        );
    }

    /**
     * Retrieves a specific club by name
     * GET /api/clubs/by-name?name=Tech Club
     */
    @GetMapping("/by-name")
    public ResponseEntity<ApiResponse<ClubResponse>> getClubByName(
            @RequestParam @NotBlank(message = "Club name is required") String name) {

        log.debug("Request received to fetch club: {}", name);
        ClubResponse club = clubService.getClubByName(name);

        return ResponseEntity.ok(
                ApiResponse.success("Club retrieved successfully", club)
        );
    }

    /**
     * Soft deletes a club
     * DELETE /api/clubs?name=Tech Club
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteClub(
            @RequestParam @NotBlank(message = "Club name is required") String name) {

        log.info("Request received to delete club: {}", name);
        clubService.deleteClub(name);
        log.info("Club deleted successfully: {}", name);

        return ResponseEntity.ok(
                ApiResponse.success("Club deleted successfully")
        );
    }
}