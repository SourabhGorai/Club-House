package com.clubHouse.tnp.controller;

import com.clubHouse.tnp.dto.ApiResponse;
import com.clubHouse.tnp.dto.request.CompanyMasterRequest;
import com.clubHouse.tnp.dto.response.BulkCompanyMasterResponse;
import com.clubHouse.tnp.dto.response.CompanyMasterResponse;
import com.clubHouse.tnp.service.CompanyMasterService;
import com.clubHouse.tnp.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/companyMaster")
public class CompanyMasterController {

    private final CompanyMasterService companyMasterService;
    private final JwtService jwtService;

    private String prn(HttpServletRequest r)  { return jwtService.extractPrnFromHeaders(r); }
    private String role(HttpServletRequest r) { return jwtService.extractRoleFromHeaders(r); }

    @PostMapping("/all/addCompany")
    public ResponseEntity<ApiResponse<CompanyMasterResponse>> addCompany(
            @RequestBody CompanyMasterRequest req,
            HttpServletRequest http
    ) {
        log.info("Request received to create company");
        CompanyMasterResponse resp = companyMasterService.addCompany(req, prn(http), role(http));
        return ResponseEntity.ok(ApiResponse.success(
                "Successfully added company to master company db",
                resp
        ));

    }

    @PostMapping("/all/addCompany/bulk")
    public ResponseEntity<ApiResponse<BulkCompanyMasterResponse>> addCompanyBulk(
            @RequestBody List<CompanyMasterRequest> requests,
            HttpServletRequest http
    ) {
        log.info("Request received to bulk create companies");

        BulkCompanyMasterResponse resp =
                companyMasterService.addCompanyBulk(requests, prn(http), role(http));

        return ResponseEntity.ok(ApiResponse.success(
                "Bulk company creation processed",
                resp
        ));
    }

    @GetMapping("/all/getAll")
    public ResponseEntity<ApiResponse<List<CompanyMasterResponse>>> getAllCompanies() {

        List<CompanyMasterResponse> resp =
                companyMasterService.getAllCompanies();

        return ResponseEntity.ok(
                ApiResponse.success("Fetched all companies", resp)
        );
    }

    @PutMapping("/all/update/{id}")
    public ResponseEntity<ApiResponse<CompanyMasterResponse>> updateCompany(
            @PathVariable Long id,
            @RequestBody CompanyMasterRequest req,
            HttpServletRequest http
    ) {

        CompanyMasterResponse resp =
                companyMasterService.updateCompany(id, req, prn(http), role(http));

        return ResponseEntity.ok(
                ApiResponse.success("Company updated successfully", resp)
        );
    }

    @DeleteMapping("/all/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(
            @PathVariable Long id,
            HttpServletRequest http
    ) {

        companyMasterService.deleteCompany(id, prn(http), role(http));

        return ResponseEntity.ok(
                ApiResponse.success("Company deleted successfully", null)
        );
    }

}
