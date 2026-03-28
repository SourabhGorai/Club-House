package com.clubHouse.tnp.controller;

import com.clubHouse.tnp.dto.ApiResponse;
import com.clubHouse.tnp.dto.response.VisitYearResponse;
import com.clubHouse.tnp.service.JwtService;
import com.clubHouse.tnp.service.YearVisitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.Path;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/visitYear")
public class YearVisitController {

    private final YearVisitService yearVisitService;
    private final JwtService jwtService;

    @PostMapping("/all/add/{year}")
    public ResponseEntity<ApiResponse<VisitYearResponse>> addYear(@PathVariable Integer year) {
        log.info("Request received to add academic session");
        VisitYearResponse resp = yearVisitService.addYear(year);
        return ResponseEntity.ok(ApiResponse.success(
                "Successfully added academic session",
                resp
        ));
    }

    @DeleteMapping("/all/delete/{yearId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long yearId,
            HttpServletRequest req
    ){
        log.info("Request received to delete academic session");
        String prn = jwtService.extractPrnFromHeaders(req);
        String role = jwtService.extractRoleFromHeaders(req);
        yearVisitService.delete(yearId, prn, role);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Successfully deleted academic session with Id: %d", yearId)
        ));
    }

}
