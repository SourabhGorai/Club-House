package com.clubHouse.event_service2.controller;

import com.clubHouse.event_service2.dto.ApiResponse;
import com.clubHouse.event_service2.dto.EventRequest;
import com.clubHouse.event_service2.dto.EventResponse;
import com.clubHouse.event_service2.exception.ServiceException;
import com.clubHouse.event_service2.model.Events;
import com.clubHouse.event_service2.model.TargetType;
import com.clubHouse.event_service2.repository.EventRepository;
import com.clubHouse.event_service2.service.EventEnrollmentService;
import com.clubHouse.event_service2.service.EventService;
import com.clubHouse.event_service2.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.Response;
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
    private final EventRepository eventRepository;
    private final EventEnrollmentService eventEnrollmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(
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
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEvents() {

        log.info("REST received to get all the events");

        List<EventResponse> resp = eventService.getAll();

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Got events with size %d", resp.size()),
                resp
        ));

    }

    @GetMapping("/myEvents")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getMyEvents(
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
    public ResponseEntity<ApiResponse<EventResponse>> getEventById(
            @PathVariable Long eventId
    ) {

        log.info("REST received to fetch event with ID: {}", eventId);

        EventResponse resp = eventService.getEventById(eventId);

        return ResponseEntity.ok(ApiResponse.success(
                "Successfully fetched event",
                resp
        ));

    }

//    @GetMapping("/idList")
//    public ResponseEntity<ApiResponse<List<EventResponse>>> getByIdList(
//            @RequestBody List<Long> ids
//    ) {
//
//        log.info("REST received to fetch event with ID: {}", eventId);
//
//    }

    @GetMapping("/targetTypes")
    public ResponseEntity<ApiResponse<List<String>>> getTargetTypes(){

        log.info("REST received to fetch all the target types");

        List<String> list = eventService.getAllTargetTypes();

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched list of size %d", list.size()),
                list
        ));

    }

    @GetMapping("/getByTargetType/{targetType}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getByTargetType (
            @PathVariable String targetType
    ) {

        TargetType type = TargetType.from(targetType);
        log.info("REST received to fetch events for target: {}", targetType);

        List<EventResponse> list = eventService.getByTargetType(type);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched list of size %d", list.size()),
                list
        ));

    }

    @GetMapping("/getByEventCreator/{prn}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getByEventCreator (
            @PathVariable String prn
    ) {

        log.info("REST received to fetch events created by: {}", prn);

        List<EventResponse> resp = eventService.getByEventCreator(prn);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d events", resp.size()),
                resp
        ));

    }

    // Get by organizer
    @GetMapping("/organizer/{organizer}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getByOrganizer (
            @PathVariable String organizer
    ) {

        log.info("REST received to get events organized by {}", organizer);

        List<EventResponse> resp = eventService.getByOrganizer(organizer);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d events", resp.size()),
                resp
        ));

    }

    // will need some endpoints according to ratings.
    @GetMapping("/ratings/{rating}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getByRatings(
            @PathVariable int rating
    ) {

        log.info("REST received to fetch events have ratings =< {}", rating);

        List<EventResponse> resp = eventService.getByRatings(rating);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d events", resp.size()),
                resp
        ));

    }

    // will need some endpoints according to targetData.
    @GetMapping("/targetData/{targetType}/{targetId}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getByTargetData (
            @PathVariable String targetType,
            @PathVariable Long targetId
    ) {

        log.info("REST received to fetch events for target with ID: {}", targetId);
        TargetType type = TargetType.from(targetType);

        List<EventResponse> resp = eventService.getByTargetData(type, targetId);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d events", resp.size()),
                resp
        ));

    }

    @PostMapping("/endEvent/{eventId}")
    public ResponseEntity<ApiResponse<EventResponse>> markEventComplete(
            @PathVariable Long eventId,
            ServerWebExchange exchange
    ) {

        log.info("RESt received to mark event completed with ID: {}", eventId);
        String prn = jwtService.extractPrnFromHeaders(exchange);
        String role = jwtService.extractRoleFromHeaders(exchange);

        EventResponse resp = eventService.markEventAsCompleted(eventId, prn, role);

        return ResponseEntity.ok(ApiResponse.success(
                "Marked event as completed successfully",
                resp
        ));
    }

    @GetMapping("/endEvent/{status}")   // true or false
    public ResponseEntity<ApiResponse<List<EventResponse>>> getByStatus(
            @PathVariable boolean status,
            ServerWebExchange exchange
    ) {

        log.info("REST received to fetch events with status");

//        String role = jwtService.extractRoleFromHeaders(exchange);

        List<EventResponse> resp = eventService.getByStatus(status);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d events", resp.size()),
                resp
        ));
    }

    @GetMapping("/deadline/{status}")   // true or false
    public ResponseEntity<ApiResponse<List<EventResponse>>> getByDeadlineStatus(
            @PathVariable String status,
            ServerWebExchange exchange
    ) {

        log.info("REST received to fetch events with deadline stauts");

        List<EventResponse> resp = eventService.getByDeadlineStatus(status);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d events", resp.size()),
                resp
        ));
    }

    @DeleteMapping("/deleteEvent/{eventId}")
    public ResponseEntity<ApiResponse<String>> deleteEvent(@PathVariable Long eventId){

        log.info("Request received to delete event with ID: {}", eventId);
        eventService.deleteById(eventId);
        return ResponseEntity.ok(ApiResponse.success(
                "Successfully deleted event",
                String.format("Successfully deleted event with ID: %d", eventId)
        ));

    }

}

