package com.clubservice.club_service.controller;

import com.clubservice.club_service.dto.ClubResponseDTO;
import com.clubservice.club_service.dto.publicClubView;
import com.clubservice.club_service.mapper.ApiResponse;
import com.clubservice.club_service.repository.ClubRepository;
import com.clubservice.club_service.service.ClubService;
import jakarta.ws.rs.Path;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("api/club")
@AllArgsConstructor
public class ClubController {

    private final ClubRepository clubRepository;
    private final ClubService clubService;

    @PostMapping("/{clubName}")
    public ResponseEntity<?> addClub(@PathVariable String clubName){
        log.info("Received request to create club: {}", clubName);

        ClubResponseDTO response = clubService.addClub(clubName);

        log.info("Club creation successful: {}", clubName);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Club created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClubResponseDTO>>> getAll() {
        log.info("Received request to get All clubs");
        List<ClubResponseDTO> list = clubService.getAll();
        return ResponseEntity.ok(
                ApiResponse.success("All clubs:", list)
        );
    }

    @DeleteMapping("/{clubName}")
    public ResponseEntity<?> deleteClub(@PathVariable String clubName){
        log.info("Received request to delete club: {}", clubName);
        clubService.deleteClub(clubName);
        log.info("Deleted club : {}", clubName);

        return ResponseEntity.ok(ApiResponse.success("Club deleted successfully", null));
    }

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<publicClubView>>> getAllPublic() {
        log.info("Received request to get All clubs in Public View");
        List<publicClubView> list = clubService.getAllPublic();
        return ResponseEntity.ok(
                ApiResponse.success("All clubs in Public View:", list)
        );
    }

}