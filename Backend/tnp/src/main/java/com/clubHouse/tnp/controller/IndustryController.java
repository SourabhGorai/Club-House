package com.clubHouse.tnp.controller;

import com.clubHouse.tnp.dto.ApiResponse;
import com.clubHouse.tnp.dto.response.IndustryResponse;
import com.clubHouse.tnp.service.IndustryService;
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
@RequestMapping("/api/industry")
public class IndustryController {

    private final IndustryService industryService;
    private final JwtService jwtService;

    private String prn(HttpServletRequest r)  { return jwtService.extractPrnFromHeaders(r); }
    private String role(HttpServletRequest r) { return jwtService.extractRoleFromHeaders(r); }

    @PostMapping("/all/add/{industry}")
    public ResponseEntity<ApiResponse<IndustryResponse>> add(@PathVariable String industry) {

        log.info("Request received to add new industry");
        IndustryResponse resp = industryService.add(industry);
        return ResponseEntity.ok(ApiResponse.success(
                "Successfully added",
                resp
        ));

    }

    @PostMapping("/all/addBulk")
    public ResponseEntity<ApiResponse<List<IndustryResponse>>> addBulk(
            @RequestBody List<String> industries
    ) {

        log.info("Request received to add new industries");
        List<IndustryResponse> resp = industryService.addBulk(industries);
        return ResponseEntity.ok(ApiResponse.success(
                "Successfully added",
                resp
        ));

    }

    @PutMapping("/all/udpate/{industryId}/{name}")
    public ResponseEntity<ApiResponse<IndustryResponse>> update(
            @PathVariable Long industryId,
            @PathVariable String name,
            HttpServletRequest http
    ) {

        log.info("Request received to update industry with ID: {}", industryId);
        IndustryResponse resp = industryService.update(industryId, name, prn(http), role(http));
        return ResponseEntity.ok(ApiResponse.success(
                "Successfully updated",
                resp
        ));

    }

    @DeleteMapping("/all/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            HttpServletRequest request
    ){

        log.info("Request received to delete industry with ID: {}", id);
        String name = industryService.delete(prn(request), role(request), id);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Successfully deleted industry: %s", name)
        ));

    }

    @GetMapping("/all/getAll")
    public ResponseEntity<ApiResponse<List<IndustryResponse>>> getAll(){

        log.info("Request received to fetch all industry ");
        List<IndustryResponse> resp = industryService.getAll();
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched list of size %d", resp.size()),
                resp
        ));

    }

    @GetMapping("/all/id/{id}")
    public ResponseEntity<ApiResponse<IndustryResponse>> getById(@PathVariable Long id){

        log.info("Request received to fetch industry by Id: {}", id);
        IndustryResponse resp = industryService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(
                "Fetched industry",
                resp
        ));

    }

}
