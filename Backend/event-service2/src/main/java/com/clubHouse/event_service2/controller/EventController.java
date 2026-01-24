package com.clubHouse.event_service2.controller;

import com.clubHouse.event_service2.dto.ApiResponse;
import com.clubHouse.event_service2.dto.EventRequest;
import com.clubHouse.event_service2.dto.EventResponse;
import com.clubHouse.event_service2.service.EventService;
import com.clubHouse.event_service2.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/events")
@Slf4j
public class EventController {

    private final EventService eventService;
    private final JwtService jwtService;

    @PostMapping
    private ResponseEntity<ApiResponse<EventResponse>> createEvent(
            @RequestBody EventRequest req,
            ServerWebExchange exchange
    ) {

        log.info("REST received to create event");

        String prn = jwtService.extractPrnFromHeaders(exchange);

        EventResponse response = eventService.createEvent(req, prn);

        return ResponseEntity.ok(ApiResponse.success(
                "Successfully created Event",
                response
        ));

    }

    @GetMapping
    private ResponseEntity<ApiResponse<List<EventResponse>>> getAllEvents() {

        log.info("REST received to get all the events");

        List<EventResponse> resp = eventService.getAll();

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Got events with size %d", resp.size()),
                resp
        ));

    }

    @GetMapping("/myEvents")
    private ResponseEntity<ApiResponse<List<EventResponse>>> getMyEvents(
            ServerWebExchange exchange
    ) {

        String prn = jwtService.extractPrnFromHeaders(exchange);

        log.info("REST received to get events cerated by PRN: {}", prn);

        List<EventResponse> resp = eventService.getMyEvents(prn);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched list with size %d", resp.size()),
                resp
        ));

    }

    // find by organizer {type (club/department), id}

    @GetMapping("/getById/{eventId}")
    private ResponseEntity<ApiResponse<EventResponse>> getEventById(
            @PathVariable Long eventId
    ) {

        log.info("REST received to fetch event with ID: {}", eventId);

        EventResponse resp = eventService.getEventbyId(eventId);

        return ResponseEntity.ok(ApiResponse.success(
                "Successfully fetched event",
                resp
        ));

    }

//    @GetMapping("/getByTargetType/{targetType}")
//    private ResponseEntity<ApiResponse<List<EventResponse>>> getByTargetType (
//            @PathVariable Long targetType
//    ) {
//
//        log.info("REST received to fetch events for target: ");
//
//    }

}

