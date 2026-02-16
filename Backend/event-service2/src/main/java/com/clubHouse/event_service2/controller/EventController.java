package com.clubHouse.event_service2.controller;

import com.clubHouse.event_service2.dto.ApiResponse;
import com.clubHouse.event_service2.dto.EventRequest;
import com.clubHouse.event_service2.dto.EventResponse;
import com.clubHouse.event_service2.model.TargetType;
import com.clubHouse.event_service2.repository.EventRepository;
import com.clubHouse.event_service2.service.EventEnrollmentService;
import com.clubHouse.event_service2.service.EventService;
import com.clubHouse.event_service2.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;  // ← Add this import
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/events")
@Slf4j
public class EventController {

    private final EventService eventService;
    private final JwtService jwtService;
//    private final EventRepository eventRepository;
//    private final EventEnrollmentService eventEnrollmentService;

    // SUPER_ADMIN, TEACHERS
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(
            @RequestBody EventRequest req,
            HttpServletRequest request
    ) {
        log.info("REST received to create event");
        String prn = jwtService.extractPrnFromHeaders(request);
        EventResponse response = eventService.createEvent(req, prn);
        return ResponseEntity.ok(ApiResponse.success(
                "Successfully created Event",
                response
        ));
    }

    // SUPER_ADMIN
    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEvents() {
        log.info("REST received to get all the events");
        List<EventResponse> resp = eventService.getAll();
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Got events with size %d", resp.size()),
                resp
        ));
    }

    // SUPER_ADMIN, TEACHERS
    // this will give the events which I have created till date
    @GetMapping("/myEvents")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getMyEvents(
            HttpServletRequest request
    ) {
        String prn = jwtService.extractPrnFromHeaders(request);  // ← Changed
        log.info("REST received to get events created by PRN: {}", prn);
        List<EventResponse> resp = eventService.getMyEvents(prn);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched list with size %d", resp.size()),
                resp
        ));
    }

    // ALL
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

    // SUPER_ADMIN, TEACHERS
    @GetMapping("/targetTypes")
    public ResponseEntity<ApiResponse<List<String>>> getTargetTypes(){
        log.info("REST received to fetch all the target types");
        List<String> list = eventService.getAllTargetTypes();
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched list of size %d", list.size()),
                list
        ));
    }

    // SUPER_ADMIN, TEACHERS
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

    // SUPER_ADMIN, TEACHERS
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

    // ALL
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

    // SUPER_ADMIN, TEACHERS
    @GetMapping("/ratings/{rating}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getByRatings(
            @PathVariable int rating
    ) {
        log.info("REST received to fetch events have ratings >= {}", rating);
        List<EventResponse> resp = eventService.getByRatings(rating);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d events", resp.size()),
                resp
        ));
    }

    // ALL
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

    // SUPER_ADMIN, TEACHERS
    @PostMapping("/endEvent/{eventId}")
    public ResponseEntity<ApiResponse<EventResponse>> markEventComplete(
            @PathVariable Long eventId,
            HttpServletRequest request  // ← Changed
    ) {
        log.info("REST received to mark event completed with ID: {}", eventId);
        String prn = jwtService.extractPrnFromHeaders(request);  // ← Changed
        String role = jwtService.extractRoleFromHeaders(request);  // ← Changed
        EventResponse resp = eventService.markEventAsCompleted(eventId, prn, role);
        return ResponseEntity.ok(ApiResponse.success(
                "Marked event as completed successfully",
                resp
        ));
    }

    // ALL
    @GetMapping("/endEvent/{status}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getByStatus(
            @PathVariable boolean status,
            HttpServletRequest request  // ← Changed (even if not used, keep signature consistent)
    ) {
        log.info("REST received to fetch events with status");
        List<EventResponse> resp = eventService.getByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d events", resp.size()),
                resp
        ));
    }

    // ALL
    @GetMapping("/enrollment/{status}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getByEnrollmentStatus(
            @PathVariable String status,
            HttpServletRequest request  // ← Changed
    ) {
        log.info("REST received to fetch events with deadline status");
        List<EventResponse> resp = eventService.getByEnrollmentStatus(status);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d events", resp.size()),
                resp
        ));
    }

    // SUPER_ADMIN, TEACHERS
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