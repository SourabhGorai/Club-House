package com.clubHouse.tnp.controller;

import com.clubHouse.tnp.dto.ApiResponse;
import com.clubHouse.tnp.dto.response.VisitYearResponse;
import com.clubHouse.tnp.service.YearVisitService;
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

    @PostMapping("/add/{year}")
    public ResponseEntity<ApiResponse<VisitYearResponse>> addYear(@PathVariable Integer year) {
        log.info("Request received to add academic session");
        VisitYearResponse resp = yearVisitService.addYear(year);
        return ResponseEntity.ok(ApiResponse.success(
                "Successfully added academic session",
                resp
        ));
    }

    @DeleteMapping("/delete/{yearId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long yearId){
        log.info("Request received to delete academic session");
        yearVisitService.delete(yearId);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Successfully deleted academic session with Id: %d", yearId)
        ));
    }

}
