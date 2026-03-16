package com.clubHouse.event_service2.controller;

import com.clubHouse.event_service2.dto.request.RestartEnrollmentRequest;
import com.clubHouse.event_service2.dto.response.ApiResponse;
import com.clubHouse.event_service2.dto.request.EventRequest;
import com.clubHouse.event_service2.dto.response.EventResponse;
import com.clubHouse.event_service2.dto.response.PageResponse;
import com.clubHouse.event_service2.dto.request.UpdateEventRequest;
import com.clubHouse.event_service2.model.TargetType;
import com.clubHouse.event_service2.service.EventService;
import com.clubHouse.event_service2.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    // ── Helper ───────────────────────────────────────────────────────────────────

    /**
     * Builds a Pageable with a safe upper-bound on page size (max 100).
     * Default sort: eventId DESC (newest first).
     */
    private Pageable buildPageable(int page, int size) {
        int safeSize = Math.min(size, 100);
        return PageRequest.of(page, safeSize, Sort.by(Sort.Direction.DESC, "eventId"));
    }

    // ── Create ───────────────────────────────────────────────────────────────────

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

    // ── Original endpoints (untouched) ───────────────────────────────────────────

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
    @GetMapping("/myEvents")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getMyEvents(
            HttpServletRequest request
    ) {
        String prn = jwtService.extractPrnFromHeaders(request);
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
    public ResponseEntity<ApiResponse<List<String>>> getTargetTypes() {
        log.info("REST received to fetch all the target types");
        List<String> list = eventService.getAllTargetTypes();
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched list of size %d", list.size()),
                list
        ));
    }

    // SUPER_ADMIN, TEACHERS
    @GetMapping("/getByTargetType/{targetType}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getByTargetType(
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
    public ResponseEntity<ApiResponse<List<EventResponse>>> getByEventCreator(
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
    public ResponseEntity<ApiResponse<List<EventResponse>>> getByOrganizer(
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
    public ResponseEntity<ApiResponse<List<EventResponse>>> getByTargetData(
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

    // ALL
    @GetMapping("/endEvent/{status}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getByStatus(
            @PathVariable boolean status,
            HttpServletRequest request
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
            HttpServletRequest request
    ) {
        log.info("REST received to fetch events with deadline status");
        List<EventResponse> resp = eventService.getByEnrollmentStatus(status);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d events", resp.size()),
                resp
        ));
    }

    // ── Paginated endpoints (new — /paged suffix) ────────────────────────────────

    // 1. SUPER_ADMIN — GET /api/events/paged?page=0&size=20
    @GetMapping("/paged")
    public ResponseEntity<ApiResponse<PageResponse<EventResponse>>> getAllEventsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("REST received to get all events paged - page: {}, size: {}", page, size);
        PageResponse<EventResponse> resp = eventService.getAllPaged(buildPageable(page, size));
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Got %d events (page %d of %d)",
                        resp.getContent().size(), resp.getPageNumber() + 1, resp.getTotalPages()),
                resp
        ));
    }

    // 2. SUPER_ADMIN, TEACHERS — GET /api/events/myEvents/paged?page=0&size=20
    @GetMapping("/myEvents/paged")
    public ResponseEntity<ApiResponse<PageResponse<EventResponse>>> getMyEventsPaged(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        String prn = jwtService.extractPrnFromHeaders(request);
        log.info("REST received to get paged events for PRN: {} - page: {}, size: {}", prn, page, size);
        PageResponse<EventResponse> resp = eventService.getMyEventsPaged(prn, buildPageable(page, size));
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d events (page %d of %d)",
                        resp.getContent().size(), resp.getPageNumber() + 1, resp.getTotalPages()),
                resp
        ));
    }

    // 3. SUPER_ADMIN, TEACHERS — GET /api/events/getByTargetType/{targetType}/paged?page=0&size=20
    @GetMapping("/getByTargetType/{targetType}/paged")
    public ResponseEntity<ApiResponse<PageResponse<EventResponse>>> getByTargetTypePaged(
            @PathVariable String targetType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        TargetType type = TargetType.from(targetType);
        log.info("REST received to fetch paged events for target: {} - page: {}, size: {}", targetType, page, size);
        PageResponse<EventResponse> resp = eventService.getByTargetTypePaged(type, buildPageable(page, size));
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d events (page %d of %d)",
                        resp.getContent().size(), resp.getPageNumber() + 1, resp.getTotalPages()),
                resp
        ));
    }

    // 4. SUPER_ADMIN, TEACHERS — GET /api/events/getByEventCreator/{prn}/paged?page=0&size=20
    @GetMapping("/getByEventCreator/{prn}/paged")
    public ResponseEntity<ApiResponse<PageResponse<EventResponse>>> getByEventCreatorPaged(
            @PathVariable String prn,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("REST received to fetch paged events created by: {} - page: {}, size: {}", prn, page, size);
        PageResponse<EventResponse> resp = eventService.getByEventCreatorPaged(prn, buildPageable(page, size));
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d events (page %d of %d)",
                        resp.getContent().size(), resp.getPageNumber() + 1, resp.getTotalPages()),
                resp
        ));
    }

    // 5. ALL — GET /api/events/organizer/{organizer}/paged?page=0&size=20
    @GetMapping("/organizer/{organizer}/paged")
    public ResponseEntity<ApiResponse<PageResponse<EventResponse>>> getByOrganizerPaged(
            @PathVariable String organizer,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("REST received to get paged events organized by {} - page: {}, size: {}", organizer, page, size);
        PageResponse<EventResponse> resp = eventService.getByOrganizerPaged(organizer, buildPageable(page, size));
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d events (page %d of %d)",
                        resp.getContent().size(), resp.getPageNumber() + 1, resp.getTotalPages()),
                resp
        ));
    }

    // 6. SUPER_ADMIN, TEACHERS — GET /api/events/ratings/{rating}/paged?page=0&size=20
    @GetMapping("/ratings/{rating}/paged")
    public ResponseEntity<ApiResponse<PageResponse<EventResponse>>> getByRatingsPaged(
            @PathVariable int rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("REST received to fetch paged events with ratings >= {} - page: {}, size: {}", rating, page, size);
        PageResponse<EventResponse> resp = eventService.getByRatingsPaged(rating, buildPageable(page, size));
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d events (page %d of %d)",
                        resp.getContent().size(), resp.getPageNumber() + 1, resp.getTotalPages()),
                resp
        ));
    }

    // 7. ALL — GET /api/events/targetData/{targetType}/{targetId}/paged?page=0&size=20
    @GetMapping("/targetData/{targetType}/{targetId}/paged")
    public ResponseEntity<ApiResponse<PageResponse<EventResponse>>> getByTargetDataPaged(
            @PathVariable String targetType,
            @PathVariable Long targetId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("REST received to fetch paged events for target ID: {} - page: {}, size: {}", targetId, page, size);
        TargetType type = TargetType.from(targetType);
        PageResponse<EventResponse> resp = eventService.getByTargetDataPaged(type, targetId, buildPageable(page, size));
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d events (page %d of %d)",
                        resp.getContent().size(), resp.getPageNumber() + 1, resp.getTotalPages()),
                resp
        ));
    }

    // 8. ALL — GET /api/events/endEvent/{status}/paged?page=0&size=20
    @GetMapping("/endEvent/{status}/paged")
    public ResponseEntity<ApiResponse<PageResponse<EventResponse>>> getByStatusPaged(
            @PathVariable boolean status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("REST received to fetch paged events with isCompleted = {} - page: {}, size: {}", status, page, size);
        PageResponse<EventResponse> resp = eventService.getByStatusPaged(status, buildPageable(page, size));
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d events (page %d of %d)",
                        resp.getContent().size(), resp.getPageNumber() + 1, resp.getTotalPages()),
                resp
        ));
    }

    // 9. ALL — GET /api/events/enrollment/{status}/paged?page=0&size=20
    @GetMapping("/enrollment/{status}/paged")
    public ResponseEntity<ApiResponse<PageResponse<EventResponse>>> getByEnrollmentStatusPaged(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("REST received to fetch paged events with enrollmentStatus = {} - page: {}, size: {}", status, page, size);
        PageResponse<EventResponse> resp = eventService.getByEnrollmentStatusPaged(status, buildPageable(page, size));
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d events (page %d of %d)",
                        resp.getContent().size(), resp.getPageNumber() + 1, resp.getTotalPages()),
                resp
        ));
    }

    // ── Write ─────────────────────────────────────────────────────────────────────

    // SUPER_ADMIN, TEACHERS
    @PostMapping("/completeEvent/{eventId}")
    public ResponseEntity<ApiResponse<EventResponse>> markEventComplete(
            @PathVariable Long eventId,
            HttpServletRequest request
    ) {
        log.info("REST received to mark event completed with ID: {}", eventId);
        String prn = jwtService.extractPrnFromHeaders(request);
        String role = jwtService.extractRoleFromHeaders(request);
        EventResponse resp = eventService.markEventAsCompleted(eventId, prn, role);
        return ResponseEntity.ok(ApiResponse.success(
                "Marked event as completed successfully",
                resp
        ));
    }

    // SUPER_ADMIN, TEACHERS
    @DeleteMapping("/deleteEvent/{eventId}")
    public ResponseEntity<ApiResponse<String>> deleteEvent(@PathVariable Long eventId) {
        log.info("Request received to delete event with ID: {}", eventId);
        eventService.deleteById(eventId);
        return ResponseEntity.ok(ApiResponse.success(
                "Successfully deleted event",
                String.format("Successfully deleted event with ID: %d", eventId)
        ));
    }

    // SUPER_ADMIN, TEACHERS (only event creator or admin)
    @PutMapping("/updateEvent/{eventId}")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(
            @PathVariable Long eventId,
            @RequestBody UpdateEventRequest request,
            HttpServletRequest httpRequest
    ) {
        log.info("REST received to update event with ID: {}", eventId);
        String prn = jwtService.extractPrnFromHeaders(httpRequest);
        String role = jwtService.extractRoleFromHeaders(httpRequest);
        EventResponse resp = eventService.updateEvent(eventId, request, prn, role);
        return ResponseEntity.ok(ApiResponse.success(
                "Event updated successfully",
                resp
        ));
    }

    @PutMapping("/restartEnrollment")
    public ResponseEntity<ApiResponse<Void>> restartEnrollment(
            @RequestBody RestartEnrollmentRequest req
    ){

        log.info("Request received to restart enrollment with ID: {}", req.getEventId());
        eventService.restartEnrollment(req);
        return ResponseEntity.ok(ApiResponse.success(
                "Enrollment started successfully",
                null
        ));

    }

    // need an endpoint to fetch total events for me (global, dept, club)
}