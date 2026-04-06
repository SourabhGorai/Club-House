package com.clubHouse.tnp.controller;

import com.clubHouse.tnp.dto.ApiResponse;
import com.clubHouse.tnp.dto.request.AddUserRequest;
import com.clubHouse.tnp.dto.request.BulkUserTnpRequest;
import com.clubHouse.tnp.dto.request.RoleTenureChangeRequest;
import com.clubHouse.tnp.dto.response.BulkUserTnpResponse;
import com.clubHouse.tnp.dto.response.PageResponse;
import com.clubHouse.tnp.dto.response.ProfileEnrichedUserResponse;
import com.clubHouse.tnp.dto.response.UserTnpResponse;
import com.clubHouse.tnp.service.JwtService;
import com.clubHouse.tnp.service.TnpService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/tnp")
public class TnpController {

    private final TnpService tnpService;
    private final JwtService jwtService;

    // ── Helper ───────────────────────────────────────────────────────────────────

    private Pageable buildPageable(int page, int size) {
        int safeSize = Math.min(size, 100);
        return PageRequest.of(page, safeSize, Sort.by(Sort.Direction.DESC, "id"));
    }


    @PostMapping("/all/add")
    public ResponseEntity<ApiResponse<UserTnpResponse>> addUserToTnp(
            @Valid @RequestBody AddUserRequest request,
            HttpServletRequest req
    ) {
        log.info("Request received to add user {} in TNP", request.getPrn());
        String prn = jwtService.extractPrnFromHeaders(req);
        String role = jwtService.extractRoleFromHeaders(req);
        UserTnpResponse response = tnpService.addUserToClub(request, prn, role);
        log.info("User {} added to club {} successfully", request.getPrn(),
                "Training & Placement Department");
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("User added to club successfully", response));
    }


    @PostMapping("/all/bulkAdd")
    public ResponseEntity<ApiResponse<BulkUserTnpResponse>> addUsersToTnpBulk(
            @Valid @RequestBody BulkUserTnpRequest request,
            HttpServletRequest req
    ) {
        log.info("Request received to add {} user-club associations in bulk",
                request.getAssociations().size());
        String prn = jwtService.extractPrnFromHeaders(req);
        String role = jwtService.extractRoleFromHeaders(req);
        BulkUserTnpResponse response = tnpService.addUsersToTnpBulk(request, prn, role);
        log.info("Bulk user-club creation completed. Success: {}, Failed: {}",
                response.getSuccessCount(), response.getFailedCount());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bulk user-club creation completed", response));
    }

    // ── Original endpoints (untouched) ───────────────────────────────────────────

    @GetMapping("/all/getByPrn/{prn}")
    public ResponseEntity<ApiResponse<ProfileEnrichedUserResponse>> getByPrn(
            @PathVariable String prn
    ) {

        log.info("Request received to fetch user with prn: {}", prn);
        ProfileEnrichedUserResponse profile = tnpService.getByPrn(prn);
        return ResponseEntity.ok(ApiResponse.success(
                "Successfully fetched",
                profile
        ));

    }


    @GetMapping("/all/getAll/{activeStatus}")
    public ResponseEntity<ApiResponse<List<ProfileEnrichedUserResponse>>> getAllTnpMembers(
            @PathVariable boolean activeStatus
    ) {
        log.debug("Request received to fetch all members");
        List<ProfileEnrichedUserResponse> associations = tnpService.getAllMembers(activeStatus);
        return ResponseEntity.ok(
                ApiResponse.success(
                        String.format("Retrieved %d user-club associations with profile details",
                                associations.size()),
                        associations
                )
        );
    }


    @GetMapping("/all/club/year/{year}")
    public ResponseEntity<ApiResponse<List<ProfileEnrichedUserResponse>>> getClubMembersByYear(
            @PathVariable @NotNull(message = "Year is required") Integer year) {
        log.debug("Request received to fetch members filtered by year {}", year);
        List<ProfileEnrichedUserResponse> members = tnpService.getMembersByYear(year);
        return ResponseEntity.ok(
                ApiResponse.success(
                        String.format("Retrieved %d members with profile details in year %d",
                                members.size(), year),
                        members
                )
        );
    }

    // SUPER_ADMIN
    @DeleteMapping("/tr/permanentlyDelete/{prn}")
    public void permanentlyDelete(
            @PathVariable String prn,
            HttpServletRequest req
    ) {
        log.info("REST received to permanently delete user from club db with prn: {}", prn);
        String requesterPrn = jwtService.extractPrnFromHeaders(req);
        String role = jwtService.extractRoleFromHeaders(req);
        tnpService.permanentlyDelete(prn, requesterPrn, role);
    }

    @GetMapping("/all/getAllByRole/{role}")
    public ResponseEntity<ApiResponse<List<ProfileEnrichedUserResponse>>> getAllByRole(
            @PathVariable String role
    ) {
        log.info("REST received to fetch users with role in clubs");
        List<ProfileEnrichedUserResponse> resp = tnpService.getAllByRole(role);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Successfully fetched %d response", resp.size()),
                resp
        ));
    }

    // ── Paginated endpoints (new — /paged suffix) ─────────────────────────────────

    @GetMapping("/all/getAll/paged")
    public ResponseEntity<ApiResponse<PageResponse<ProfileEnrichedUserResponse>>> getAllPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.debug("Request received to fetch paged user-club associations - page: {}, size: {}", page, size);
        PageResponse<ProfileEnrichedUserResponse> resp =
                tnpService.getAllMembersPaged(buildPageable(page, size));
        return ResponseEntity.ok(
                ApiResponse.success(
                        String.format("Retrieved %d user-club associations (page %d of %d)",
                                resp.getContent().size(), resp.getPageNumber() + 1, resp.getTotalPages()),
                        resp
                )
        );
    }

    // 2. GET /api/user-clubs/club/{clubName}/year/{year}/paged?page=0&size=20
    @GetMapping("/all/year/{year}/paged")
    public ResponseEntity<ApiResponse<PageResponse<ProfileEnrichedUserResponse>>> getClubMembersByYearPaged(
            @PathVariable @NotNull(message = "Year is required") Integer year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.debug("Request received to fetch paged members filtered by year {} - page: {}, size: {}",
                year, page, size);
        PageResponse<ProfileEnrichedUserResponse> resp =
                tnpService.getMembersByYearPaged(year, buildPageable(page, size));
        return ResponseEntity.ok(
                ApiResponse.success(
                        String.format("Retrieved %d members in year %d (page %d of %d)",
                                resp.getContent().size(), year,
                                resp.getPageNumber() + 1, resp.getTotalPages()),
                        resp
                )
        );
    }

    // *******************************************************************************

    @GetMapping("/all/getAllClubRoles")
    public ResponseEntity<ApiResponse<List<String>>> getAllClubRoles(){
        log.debug("Request received to fetch all the club roles");
        List<String> roles = tnpService.getAllClubRoles();
        return ResponseEntity.ok(ApiResponse.success(
                "Fetched successfully",
                roles
        ));
    }

    @PutMapping("/tr/changeClubRole")
    public ResponseEntity<ApiResponse<Void>> changeRoleTenure(
            @Valid @RequestBody RoleTenureChangeRequest req,
            HttpServletRequest httpReq
    ) {

        log.debug("Request received to change role of user: {} to {}", req.getPrn(), req.getNewRole());

        String requesterPrn = jwtService.extractPrnFromHeaders(httpReq);
        String role = jwtService.extractRoleFromHeaders(httpReq);

        tnpService.changeRoleTenure(req, requesterPrn, role);
        return ResponseEntity.ok(ApiResponse.success("Role Changed Successfully"));

    }

}
