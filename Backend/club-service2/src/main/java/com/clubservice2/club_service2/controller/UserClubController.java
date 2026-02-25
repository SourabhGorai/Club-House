package com.clubservice2.club_service2.controller;

import com.clubservice2.club_service2.dto.request.RoleChangeRequest;
import com.clubservice2.club_service2.model.ClubRoles;
import com.clubservice2.club_service2.model.UserClub;
import com.clubservice2.club_service2.service.UserClubService;
import com.clubservice2.club_service2.dto.ApiResponse;
import com.clubservice2.club_service2.dto.request.BulkUserClubRequest;
import com.clubservice2.club_service2.dto.request.UserClubRequest;
import com.clubservice2.club_service2.dto.response.*;
import com.clubservice2.club_service2.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.catalina.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    private final JwtService jwtService;

    // ── Helper ───────────────────────────────────────────────────────────────────

    private Pageable buildPageable(int page, int size) {
        int safeSize = Math.min(size, 100);
        return PageRequest.of(page, safeSize, Sort.by(Sort.Direction.DESC, "id"));
    }

    // ── Create ───────────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<ApiResponse<UserClubResponse>> addUserToClub(
            @Valid @RequestBody UserClubRequest request,
            HttpServletRequest req
    ) {
        log.info("Request received to add user {} to club {}", request.getPrn(), request.getClubId());
        String prn = jwtService.extractPrnFromHeaders(req);
        String role = jwtService.extractRoleFromHeaders(req);
        UserClubResponse response = userClubService.addUserToClub(request, prn, role);
        log.info("User {} added to club {} successfully", request.getPrn(), response.getClubName());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("User added to club successfully", response));
    }

    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<BulkUserClubResponse>> addUsersToClubsBulk(
            @Valid @RequestBody BulkUserClubRequest request,
            HttpServletRequest req
    ) {
        log.info("Request received to add {} user-club associations in bulk",
                request.getAssociations().size());
        String prn = jwtService.extractPrnFromHeaders(req);
        String role = jwtService.extractRoleFromHeaders(req);
        BulkUserClubResponse response = userClubService.addUsersToClubsBulk(request, prn, role);
        log.info("Bulk user-club creation completed. Success: {}, Failed: {}",
                response.getSuccessCount(), response.getFailedCount());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bulk user-club creation completed", response));
    }

    // ── Original endpoints (untouched) ───────────────────────────────────────────

    // SUPER_ADMIN, TEACHERS
    @GetMapping("/user/{prn}")
    public ResponseEntity<ApiResponse<List<ProfileEnrichedUserClubResponse>>> getUserClubs(
            @PathVariable @NotBlank(message = "PRN is required") String prn,
            HttpServletRequest request
    ) {
        log.debug("Request received to fetch clubs for user: {}", prn);
        String role = jwtService.extractRoleFromHeaders(request);
        List<ProfileEnrichedUserClubResponse> clubs = userClubService.getUserClubs(prn, role);
        return ResponseEntity.ok(
                ApiResponse.success(
                        String.format("Retrieved %d club associations with profile details for user %s",
                                clubs.size(), prn),
                        clubs
                )
        );
    }

    // TEACHERS, SUPER_ADMIN
    @GetMapping("/user/{prn}/club-names")
    public ResponseEntity<ApiResponse<List<String>>> getUserClubNames(
            @PathVariable @NotBlank(message = "PRN is required") String prn) {
        log.debug("Request received to fetch club names for user: {}", prn);
        List<String> clubNames = userClubService.getUserClubNames(prn);
        return ResponseEntity.ok(
                ApiResponse.success(
                        String.format("Retrieved %d clubs for user %s", clubNames.size(), prn),
                        clubNames
                )
        );
    }

    // SUPER_ADMIN
    @GetMapping("/getAll")
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

    @GetMapping("/club/{clubName}")
    public ResponseEntity<ApiResponse<List<ProfileEnrichedUserClubResponse>>> getClubMembers(
            @PathVariable @NotBlank(message = "Club name is required") String clubName,
            HttpServletRequest request
    ) {
        log.debug("Request received to fetch members of club: {}", clubName);
        String prn = jwtService.extractPrnFromHeaders(request);
        String role = jwtService.extractRoleFromHeaders(request);
        log.info("{} + {}", prn, role);
        List<ProfileEnrichedUserClubResponse> members = userClubService.getClubMembers(clubName, prn, role);
        return ResponseEntity.ok(
                ApiResponse.success(
                        String.format("Retrieved %d members with profile details for club %s",
                                members.size(), clubName),
                        members
                )
        );
    }

    @GetMapping("/club/{clubName}/prns")
    public ResponseEntity<ApiResponse<ClubPrnsResponse>> getClubPrns(
            @PathVariable @NotBlank(message = "Club name is required") String clubName) {
        log.debug("Request received to fetch PRNs for club: {}", clubName);
        ClubPrnsResponse response = userClubService.getClubPrns(clubName);
        return ResponseEntity.ok(
                ApiResponse.success(
                        String.format("Retrieved %d PRNs for club %s", response.getTotalCount(), clubName),
                        response
                )
        );
    }

    @GetMapping("/club/{clubName}/year/{year}")
    public ResponseEntity<ApiResponse<List<ProfileEnrichedUserClubResponse>>> getClubMembersByYear(
            @PathVariable @NotBlank(message = "Club name is required") String clubName,
            @PathVariable @NotNull(message = "Year is required") Integer year) {
        log.debug("Request received to fetch members for club {} filtered by year {}", clubName, year);
        List<ProfileEnrichedUserClubResponse> members = userClubService.getClubMembersByYear(clubName, year);
        return ResponseEntity.ok(
                ApiResponse.success(
                        String.format("Retrieved %d members with profile details for club %s in year %d",
                                members.size(), clubName, year),
                        members
                )
        );
    }

    @DeleteMapping("/user/{prn}/club/{clubName}")
    public ResponseEntity<ApiResponse<Void>> removeUserFromClub(
            @PathVariable @NotBlank(message = "PRN is required") String prn,
            @PathVariable @NotBlank(message = "Club name is required") String clubName,
            HttpServletRequest request
    ) {
        log.info("Request received to remove user {} from club {}", prn, clubName);
        String requesterPrn = jwtService.extractPrnFromHeaders(request);
        String requesterRole = jwtService.extractRoleFromHeaders(request);
        userClubService.removeUserFromClub(prn, clubName, requesterPrn, requesterRole);
        log.info("User {} removed from club {} successfully", prn, clubName);
        return ResponseEntity.ok(ApiResponse.success("User removed from club successfully"));
    }

    // SUPER_ADMIN
    @DeleteMapping("/permanentlyDelete/{prn}")
    public void permanentlyDelete(@PathVariable String prn) {
        log.info("REST received to permanently delete user from club db with prn: {}", prn);
        userClubService.permanentlyDelete(prn);
    }

    @GetMapping("/getAllByRole/{role}")
    public ResponseEntity<ApiResponse<List<ProfileEnrichedUserClubResponse>>> getAllByRole(
            @PathVariable String role
    ) {
        log.info("REST received to fetch users with role in clubs");
        List<ProfileEnrichedUserClubResponse> resp = userClubService.getAllByRole(role);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Successfully fetched %d response", resp.size()),
                resp
        ));
    }

    @GetMapping("/getMyClubs")
    public ResponseEntity<ApiResponse<List<GeneralClubResponse>>> getMyClub(
            HttpServletRequest request
    ) {
        log.info("Request received to display all my clubs");
        String prn = jwtService.extractPrnFromHeaders(request);
        List<GeneralClubResponse> resp = userClubService.getMyClubs(prn);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Successfully fetched %d response", resp.size()),
                resp
        ));
    }

    // ── Paginated endpoints (new — /paged suffix) ─────────────────────────────────

    // 1. SUPER_ADMIN — GET /api/user-clubs/getAll/paged?page=0&size=20
    @GetMapping("/getAll/paged")
    public ResponseEntity<ApiResponse<PageResponse<ProfileEnrichedUserClubResponse>>> getAllUserClubAssociationsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.debug("Request received to fetch paged user-club associations - page: {}, size: {}", page, size);
        PageResponse<ProfileEnrichedUserClubResponse> resp =
                userClubService.getAllUserClubAssociationsPaged(buildPageable(page, size));
        return ResponseEntity.ok(
                ApiResponse.success(
                        String.format("Retrieved %d user-club associations (page %d of %d)",
                                resp.getContent().size(), resp.getPageNumber() + 1, resp.getTotalPages()),
                        resp
                )
        );
    }

    // 2. GET /api/user-clubs/club/{clubName}/paged?page=0&size=20
    @GetMapping("/club/{clubName}/paged")
    public ResponseEntity<ApiResponse<PageResponse<ProfileEnrichedUserClubResponse>>> getClubMembersPaged(
            @PathVariable @NotBlank(message = "Club name is required") String clubName,
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.debug("Request received to fetch paged members of club: {} - page: {}, size: {}", clubName, page, size);
        String prn = jwtService.extractPrnFromHeaders(request);
        String role = jwtService.extractRoleFromHeaders(request);
        PageResponse<ProfileEnrichedUserClubResponse> resp =
                userClubService.getClubMembersPaged(clubName, prn, role, buildPageable(page, size));
        return ResponseEntity.ok(
                ApiResponse.success(
                        String.format("Retrieved %d members for club %s (page %d of %d)",
                                resp.getContent().size(), clubName,
                                resp.getPageNumber() + 1, resp.getTotalPages()),
                        resp
                )
        );
    }

    // 3. GET /api/user-clubs/club/{clubName}/year/{year}/paged?page=0&size=20
    @GetMapping("/club/{clubName}/year/{year}/paged")
    public ResponseEntity<ApiResponse<PageResponse<ProfileEnrichedUserClubResponse>>> getClubMembersByYearPaged(
            @PathVariable @NotBlank(message = "Club name is required") String clubName,
            @PathVariable @NotNull(message = "Year is required") Integer year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.debug("Request received to fetch paged members for club {} filtered by year {} - page: {}, size: {}",
                clubName, year, page, size);
        PageResponse<ProfileEnrichedUserClubResponse> resp =
                userClubService.getClubMembersByYearPaged(clubName, year, buildPageable(page, size));
        return ResponseEntity.ok(
                ApiResponse.success(
                        String.format("Retrieved %d members for club %s in year %d (page %d of %d)",
                                resp.getContent().size(), clubName, year,
                                resp.getPageNumber() + 1, resp.getTotalPages()),
                        resp
                )
        );
    }

    // *******************************************************************************

    @GetMapping("/getAllClubRoles")
    public ResponseEntity<ApiResponse<List<String>>> getAllClubRoles(){
        log.debug("Request received to fetch all the club roles");
        List<String> roles = userClubService.getAllClubRoles();
        return ResponseEntity.ok(ApiResponse.success(
                "Fetched successfully",
                roles
        ));
    }

    @PostMapping("/changeClubRole")
    public ResponseEntity<ApiResponse<Void>> changeRole(
            @Valid @RequestBody RoleChangeRequest req) {

        log.debug("Request received to change role of user: {} to {}", req.getPrn(), req.getNewRole());

        userClubService.changeRole(req);
        return ResponseEntity.ok(ApiResponse.success("Role Changed Successfully"));

    }
}