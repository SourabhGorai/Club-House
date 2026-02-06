package com.clubHouse.event_service2.controller;

import com.clubHouse.event_service2.dto.*;
import com.clubHouse.event_service2.service.EventEnrollmentService;
import com.clubHouse.event_service2.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/enrollment")
public class EventEnrollmentController {

    private final EventEnrollmentService enrollmentService;
    private final JwtService jwtService;

    @PostMapping("{eventId}")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> enrollMe(
            @PathVariable Long eventId,
            ServerWebExchange exchange
    ) {

        log.info("Request received to create an enrollment in event with ID: {}", eventId);

        String prn = jwtService.extractPrnFromHeaders(exchange);

        EnrollmentResponse resp = enrollmentService.enrollMe(eventId, prn);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Successfully enrolled %s in event %d", prn, eventId),
                resp
        ));

    }

    @GetMapping("/getAll")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getMyAllEnrollments(
            ServerWebExchange exchange
    ) {

        String prn = jwtService.extractPrnFromHeaders(exchange);
        log.info("Request received to fetch all the event enrollments for prn: {}", prn);

        List<EnrollmentResponse> list = enrollmentService.getMyAllEnrollments(prn);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d enrollments", list.size()),
                list
        ));

    }

    @GetMapping("/myEnrollments")
    public ResponseEntity<ApiResponse<Map<EventResponse, String>>> getMyEnrolledEvents(
            ServerWebExchange exchange
    ) {

        String prn = jwtService.extractPrnFromHeaders(exchange);
        log.info("Request received to fetch all the event enrolled events for prn: {}", prn);

        Map<EventResponse, String> list = enrollmentService.getMyEnrolledEvents(prn);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d enrollments", list.size()),
                list
        ));

    }

    @GetMapping("/getForEvent/{eventId}")
    public ResponseEntity<ApiResponse<List<CompleteEnrollmentResponse>>>
    getEnrollmentsForEventId(
            @PathVariable Long eventId
    ) {

        log.info("Request received to fetch enrollments for event Id: {}", eventId);

        List<CompleteEnrollmentResponse> resp = enrollmentService.getForEvent(eventId);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Got %d response", resp.size()),
                resp
        ));
    }

    @DeleteMapping("/revokeEnrollment/{enrollmentId}")
    public ResponseEntity<ApiResponse<String>> revokeMyEnrollment(
            @PathVariable Long enrollmentId
    ) {

        log.info("Request received to revoke enrollment from eventId: {}", enrollmentId);
        enrollmentService.revokeMyEnrollment(enrollmentId);

        return ResponseEntity.ok(ApiResponse.success(
                "Successfully removed enrollment",
                "Successfully removed enrollment"
        ));

    }

}
