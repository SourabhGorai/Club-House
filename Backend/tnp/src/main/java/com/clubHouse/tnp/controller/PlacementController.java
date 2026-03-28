package com.clubHouse.tnp.controller;

import com.clubHouse.tnp.dto.ApiResponse;
import com.clubHouse.tnp.dto.request.BulkPlacementRequest;
import com.clubHouse.tnp.dto.request.PlacementRequest;
import com.clubHouse.tnp.dto.response.BulkPlacementResponse;
import com.clubHouse.tnp.dto.response.PlacementResponse;
import com.clubHouse.tnp.dto.response.PlacementStatsResponse;
import com.clubHouse.tnp.service.JwtService;
import com.clubHouse.tnp.service.PlacementService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/placements")
@RequiredArgsConstructor
public class PlacementController {

    private final PlacementService placementService;
    private final JwtService jwtService;

    private String prn(HttpServletRequest r) {
        return jwtService.extractPrnFromHeaders(r);
    }

    private String role(HttpServletRequest r) {
        return jwtService.extractRoleFromHeaders(r);
    }

    // ── Write endpoints ───────────────────────────────────────────────────────

    @PostMapping("/all/create")
    public ResponseEntity<ApiResponse<PlacementResponse>> createPlacement(
            @Valid @RequestBody PlacementRequest request,
            HttpServletRequest req
    ) {

        PlacementResponse data = placementService.createPlacement(request, prn(req), role(req));
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Placement created successfully", data));
    }

    @PostMapping("/all/create/bulk")
    public ResponseEntity<ApiResponse<BulkPlacementResponse>> createBulkPlacements(
            @RequestBody BulkPlacementRequest request,
            HttpServletRequest req
    ) {
        BulkPlacementResponse data = placementService.createBulkPlacements(request, prn(req), role(req));
        return ResponseEntity
                .status(HttpStatus.MULTI_STATUS)   // 207 — some may have failed
                .body(ApiResponse.success("Bulk placement processing complete", data));
    }

    @PutMapping("/all/{placementId}")
    public ResponseEntity<ApiResponse<PlacementResponse>> updatePlacement(
            @PathVariable Long placementId,
            @Valid @RequestBody PlacementRequest request,
            HttpServletRequest req) {

        PlacementResponse data = placementService.updatePlacement(
                placementId, request, prn(req), role(req));
        return ResponseEntity.ok(ApiResponse.success("Placement updated successfully", data));
    }

    @DeleteMapping("/all/{placementId}")
    public ResponseEntity<ApiResponse<Void>> deletePlacement(@PathVariable Long placementId,
                                                             HttpServletRequest req) {
        placementService.deletePlacement(placementId, prn(req), role(req));
        return ResponseEntity.ok(ApiResponse.<Void>success("Placement deleted successfully"));
    }

    // ── Read endpoints ────────────────────────────────────────────────────────

    @GetMapping("/all/{placementId}")
    public ResponseEntity<ApiResponse<PlacementResponse>> getById(
            @PathVariable Long placementId,
            HttpServletRequest req) {

        PlacementResponse data = placementService.getPlacementById(
                placementId, prn(req), role(req));
        return ResponseEntity.ok(ApiResponse.success("Placement fetched successfully", data));
    }

    /**
     * GET /api/v1/placements/student/{prn}
     * A student can be placed in multiple companies, so this returns a List.
     */
    @GetMapping("/all/student/{prn}")
    public ResponseEntity<ApiResponse<List<PlacementResponse>>> getByPrn(
            @PathVariable String prn,
            HttpServletRequest req) {

        List<PlacementResponse> data = placementService.getPlacementsByPrn(
                prn, prn(req), role(req));
        return ResponseEntity.ok(ApiResponse.success("Placements fetched successfully", data));
    }

    /**
     * GET /api/v1/placements
     * ?page=0&size=20&sort=placedAt,desc
     */
    @GetMapping("/all/getAll")
    public ResponseEntity<ApiResponse<Page<PlacementResponse>>> getAll(
            @PageableDefault(size = 20, sort = "placedAt", direction = Sort.Direction.DESC)
            Pageable pageable) {

        Page<PlacementResponse> data = placementService.getAllPlacements(pageable);
        return ResponseEntity.ok(ApiResponse.success("Placements fetched successfully", data));
    }

    /**
     * GET /api/v1/placements/company/{companyId}
     * ?page=0&size=20&sort=packageOffered,desc
     */
    @GetMapping("/all/company/{companyId}")
    public ResponseEntity<ApiResponse<Page<PlacementResponse>>> getByCompany(
            @PathVariable Long companyId,
            @PageableDefault(size = 20, sort = "packageOffered", direction = Sort.Direction.DESC)
            Pageable pageable,
            HttpServletRequest req
    ) {

        Page<PlacementResponse> data = placementService.getPlacementsByCompany(
                companyId, pageable, prn(req), role(req));
        return ResponseEntity.ok(ApiResponse.success("Placements fetched successfully", data));
    }

    /**
     * GET /api/v1/placements/session/{session}
     * Example: /session/2024-25
     */
    @GetMapping("/all/session/{session}")
    public ResponseEntity<ApiResponse<Page<PlacementResponse>>> getBySession(
            @PathVariable String session,
            @PageableDefault(size = 20, sort = "placedAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {

        Page<PlacementResponse> data = placementService.getPlacementsBySession(
                session, pageable);
        return ResponseEntity.ok(ApiResponse.success("Placements fetched successfully", data));
    }

    /**
     * GET /api/v1/placements/role/{role}
     * Example: /role/SDE
     */
    @GetMapping("/all/role/{role}")
    public ResponseEntity<ApiResponse<Page<PlacementResponse>>> getByRole(
            @PathVariable String role,
            @PageableDefault(size = 20, sort = "packageOffered", direction = Sort.Direction.DESC)
            Pageable pageable,
            HttpServletRequest req
    ) {

        Page<PlacementResponse> data = placementService.getPlacementsByRole(
                role, pageable, prn(req), role(req));
        return ResponseEntity.ok(ApiResponse.success("Placements fetched successfully", data));
    }

    /**
     * GET /api/v1/placements/industry/{industryId}
     */
    @GetMapping("/all/industry/{industryId}")
    public ResponseEntity<ApiResponse<Page<PlacementResponse>>> getByIndustry(
            @PathVariable Long industryId,
            @PageableDefault(size = 20, sort = "placedAt", direction = Sort.Direction.DESC)
            Pageable pageable,
            HttpServletRequest req
    ) {

        Page<PlacementResponse> data = placementService.getPlacementsByIndustry(
                industryId, pageable, prn(req), role(req));
        return ResponseEntity.ok(ApiResponse.success("Placements fetched successfully", data));
    }

    /**
     * GET /api/v1/placements/package?min=5.0&max=20.0
     */
    @GetMapping("/all/package")
    public ResponseEntity<ApiResponse<Page<PlacementResponse>>> getByPackageRange(
            @RequestParam Double min,
            @RequestParam Double max,
            @PageableDefault(size = 20, sort = "packageOffered", direction = Sort.Direction.DESC)
            Pageable pageable,
            HttpServletRequest req
    ) {

        Page<PlacementResponse> data = placementService.getPlacementsByPackageRange(
                min, max, pageable, prn(req), role(req));
        return ResponseEntity.ok(ApiResponse.success("Placements fetched successfully", data));
    }

    /**
     * GET /api/v1/placements/stats/{session}
     * Returns aggregate stats: count, avg package, highest package.
     */
    @GetMapping("/all/stats/{session}")
    public ResponseEntity<ApiResponse<PlacementStatsResponse>> getStats(
            @PathVariable String session,
            HttpServletRequest req
    ) {

        PlacementStatsResponse data = placementService.getStatsBySession(
                session, prn(req), role(req));
        return ResponseEntity.ok(ApiResponse.success("Stats fetched successfully", data));
    }
}