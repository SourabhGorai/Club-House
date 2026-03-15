package com.clubHouse.event_service2.controller;

import com.clubHouse.event_service2.dto.request.RatingRequest;
import com.clubHouse.event_service2.dto.response.ApiResponse;
import com.clubHouse.event_service2.dto.response.RatingResponse;
import com.clubHouse.event_service2.service.JwtService;
import com.clubHouse.event_service2.service.RatingsService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ratings")
public class RatingsController {

    private final RatingsService ratingsService;
    private final JwtService jwtService;

    @PostMapping("/give")
    public ResponseEntity<ApiResponse<RatingResponse>> rateEvent(
            @RequestBody RatingRequest req,
            HttpServletRequest httpReq
    ) {

        log.info("Request received to rate event with Id: {}", req.getEventId());

        String prn = jwtService.extractPrnFromHeaders(httpReq);
        RatingResponse resp = ratingsService.rateEvent(prn, req);
        return ResponseEntity.ok(ApiResponse.success(
                "Rated event successfully",
                resp
        ));

    }

    @GetMapping("/getRatingForEvent/{eventId}")
    public ResponseEntity<ApiResponse<RatingResponse>> getRatingForEvent(
            @PathVariable Long eventId
    ) {
        log.info("Request received to fetch ratings for event with ID: {}", eventId);

        RatingResponse resp = ratingsService.getRating(eventId);
        return ResponseEntity.ok(ApiResponse.success(
                "Fetched rating successfully",
                resp
        ));
    }

    @PostMapping("/getRatingForEventIds")
    public ResponseEntity<ApiResponse<List<RatingResponse>>> getRatingForEventIds(
            @RequestBody List<Long> eventIds
    ) {
        log.info("Request received to fetch ratings for event with IDs: {}", eventIds);

        List<RatingResponse> resp = ratingsService.getRatingForIds(eventIds);
        return ResponseEntity.ok(ApiResponse.success(
                "Fetched rating successfully",
                resp
        ));
    }

}
