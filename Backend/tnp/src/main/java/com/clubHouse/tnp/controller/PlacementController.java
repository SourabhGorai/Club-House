package com.clubHouse.tnp.controller;

import com.clubHouse.tnp.dto.ApiResponse;
import com.clubHouse.tnp.dto.request.PlacementRequest;
import com.clubHouse.tnp.dto.response.PlacementResponse;
import com.clubHouse.tnp.dto.response.PlacementStatsResponse;
import com.clubHouse.tnp.service.PlacementService;
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
@RequestMapping("/api/v1/placements")
@RequiredArgsConstructor
public class PlacementController {

    private final PlacementService placementService;

    // ── Write endpoints ───────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<ApiResponse<PlacementResponse>> createPlacement(
            @Valid @RequestBody PlacementRequest request) {

        PlacementResponse data = placementService.createPlacement(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Placement created successfully", data));
    }

    @PutMapping("/{placementId}")
    public ResponseEntity<ApiResponse<PlacementResponse>> updatePlacement(
            @PathVariable Long placementId,
            @Valid @RequestBody PlacementRequest request) {

        PlacementResponse data = placementService.updatePlacement(placementId, request);
        return ResponseEntity.ok(ApiResponse.success("Placement updated successfully", data));
    }

    @DeleteMapping("/{placementId}")
    public ResponseEntity<ApiResponse<Void>> deletePlacement(@PathVariable Long placementId) {
        placementService.deletePlacement(placementId);
        return ResponseEntity.ok(ApiResponse.<Void>success("Placement deleted successfully"));
    }

    // ── Read endpoints ────────────────────────────────────────────────────────

    @GetMapping("/{placementId}")
    public ResponseEntity<ApiResponse<PlacementResponse>> getById(
            @PathVariable Long placementId) {

        PlacementResponse data = placementService.getPlacementById(placementId);
        return ResponseEntity.ok(ApiResponse.success("Placement fetched successfully", data));
    }

    /**
     * GET /api/v1/placements/student/{prn}
     * A student can be placed in multiple companies, so this returns a List.
     */
    @GetMapping("/student/{prn}")
    public ResponseEntity<ApiResponse<List<PlacementResponse>>> getByPrn(
            @PathVariable String prn) {

        List<PlacementResponse> data = placementService.getPlacementsByPrn(prn);
        return ResponseEntity.ok(ApiResponse.success("Placements fetched successfully", data));
    }

    /**
     * GET /api/v1/placements
     * ?page=0&size=20&sort=placedAt,desc
     */
    @GetMapping
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
    @GetMapping("/company/{companyId}")
    public ResponseEntity<ApiResponse<Page<PlacementResponse>>> getByCompany(
            @PathVariable Long companyId,
            @PageableDefault(size = 20, sort = "packageOffered", direction = Sort.Direction.DESC)
            Pageable pageable) {

        Page<PlacementResponse> data = placementService.getPlacementsByCompany(companyId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Placements fetched successfully", data));
    }

    /**
     * GET /api/v1/placements/session/{session}
     * Example: /session/2024-25
     */
    @GetMapping("/session/{session}")
    public ResponseEntity<ApiResponse<Page<PlacementResponse>>> getBySession(
            @PathVariable String session,
            @PageableDefault(size = 20, sort = "placedAt", direction = Sort.Direction.DESC)
            Pageable pageable) {

        Page<PlacementResponse> data = placementService.getPlacementsBySession(session, pageable);
        return ResponseEntity.ok(ApiResponse.success("Placements fetched successfully", data));
    }

    /**
     * GET /api/v1/placements/role/{role}
     * Example: /role/SDE
     */
    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponse<Page<PlacementResponse>>> getByRole(
            @PathVariable String role,
            @PageableDefault(size = 20, sort = "packageOffered", direction = Sort.Direction.DESC)
            Pageable pageable) {

        Page<PlacementResponse> data = placementService.getPlacementsByRole(role, pageable);
        return ResponseEntity.ok(ApiResponse.success("Placements fetched successfully", data));
    }

    /**
     * GET /api/v1/placements/industry/{industryId}
     */
    @GetMapping("/industry/{industryId}")
    public ResponseEntity<ApiResponse<Page<PlacementResponse>>> getByIndustry(
            @PathVariable Long industryId,
            @PageableDefault(size = 20, sort = "placedAt", direction = Sort.Direction.DESC)
            Pageable pageable) {

        Page<PlacementResponse> data = placementService.getPlacementsByIndustry(industryId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Placements fetched successfully", data));
    }

    /**
     * GET /api/v1/placements/package?min=5.0&max=20.0
     */
    @GetMapping("/package")
    public ResponseEntity<ApiResponse<Page<PlacementResponse>>> getByPackageRange(
            @RequestParam Double min,
            @RequestParam Double max,
            @PageableDefault(size = 20, sort = "packageOffered", direction = Sort.Direction.DESC)
            Pageable pageable) {

        Page<PlacementResponse> data = placementService.getPlacementsByPackageRange(min, max, pageable);
        return ResponseEntity.ok(ApiResponse.success("Placements fetched successfully", data));
    }

    /**
     * GET /api/v1/placements/stats/{session}
     * Returns aggregate stats: count, avg package, highest package.
     */
    @GetMapping("/stats/{session}")
    public ResponseEntity<ApiResponse<PlacementStatsResponse>> getStats(
            @PathVariable String session) {

        PlacementStatsResponse data = placementService.getStatsBySession(session);
        return ResponseEntity.ok(ApiResponse.success("Stats fetched successfully", data));
    }
}