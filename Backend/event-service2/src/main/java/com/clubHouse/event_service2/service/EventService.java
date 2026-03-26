package com.clubHouse.event_service2.service;

import com.clubHouse.event_service2.client.ClubServiceClient;
import com.clubHouse.event_service2.client.ProfileManagementServiceClient;
import com.clubHouse.event_service2.config.CacheConfig;
import com.clubHouse.event_service2.dto.request.EventRequest;
import com.clubHouse.event_service2.dto.request.RestartEnrollmentRequest;
import com.clubHouse.event_service2.dto.response.ClubResponse;
import com.clubHouse.event_service2.dto.response.EventResponse;
import com.clubHouse.event_service2.dto.response.PageResponse;
import com.clubHouse.event_service2.dto.response.ProfileResponse;
import com.clubHouse.event_service2.dto.request.UpdateEventRequest;
import com.clubHouse.event_service2.exception.NotFoundException;
import com.clubHouse.event_service2.exception.ServiceException;
import com.clubHouse.event_service2.mapper.EventMapper;
import com.clubHouse.event_service2.model.Events;
import com.clubHouse.event_service2.model.Ratings;
import com.clubHouse.event_service2.model.TargetData;
import com.clubHouse.event_service2.model.TargetType;
import com.clubHouse.event_service2.repository.EventEnrollmentRepository;
import com.clubHouse.event_service2.repository.EventRepository;
import com.clubHouse.event_service2.repository.RatingsRepository;
import com.clubHouse.event_service2.repository.TargetDataRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventService {

    private final EventRepository eventRepository;
    private final ProfileManagementServiceClient profileManagementServiceClient;
    private final RatingsRepository ratingsRepository;
    private final TargetDataRepository targetDataRepository;
    private final EventEnrollmentRepository eventEnrollmentRepository;
    private final ClubServiceClient clubServiceClient;

    // ── Create ──────────────────────────────────────────────────────────────────

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.ALL_EVENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.MY_EVENTS, key = "#prn"),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_TYPE, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_CREATOR, key = "#prn"),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ORGANIZER, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_DATA, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_STATUS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ENROLLMENT_STATUS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENT_COUNT_BY_CLUB, allEntries = true)
    })
    public EventResponse createEvent(EventRequest req, String prn) {

        log.info("Attempting to create event for PRN: {}", prn);

        TargetType targetType = req.getTarget();

        Events events = Events.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .speakerName(req.getSpeakerName())
                .eventDate(req.getEventDate())
                .organizer(req.getOrganizer())
                .eventCreator(prn)
                .venue(req.getVenue())
                .maxEnrollments(req.getMaxEnrollments())
                .currEnrollments(0)
                .target(targetType)
                .enrollmentDeadline(req.getEnrollmentDeadline())
                .enrollmentStatus("OPEN")
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .radiusInMeters(req.getRadiusInMeters())
                .attendanceWindowStart(req.getAttendanceWindowStart())
                .attendanceWindowEnd(req.getAttendanceWindowEnd())
                .qrRefreshIntervalSeconds(req.getQrRefreshInterval())
                .build();

        Events saved = eventRepository.save(events);

        Ratings ratings = ratingsRepository.save(
                Ratings.builder()
                        .event(events)
                        .build()
        );

        if ((req.getTarget() == TargetType.CLUB || req.getTarget() == TargetType.DEPARTMENT)
                && req.getTargetIds() != null && !req.getTargetIds().isEmpty()) {

            List<TargetData> targetDataList = req.getTargetIds().stream()
                    .map(id -> TargetData.builder()
                            .events(saved)
                            .targetType(targetType)
                            .targetId(id)
                            .build()
                    )
                    .toList();

            targetDataRepository.saveAll(targetDataList);
        }

        ProfileResponse profile = profileManagementServiceClient.getProfileByPrn(prn);

        return EventMapper.toResponse(saved, prn, profile.getFullName(), req.getTargetIds(), ratings);
    }

    // ── Read (Original — untouched) ──────────────────────────────────────────────

    @Cacheable(value = CacheConfig.ALL_EVENTS, key = "'all'")
    public List<EventResponse> getAll() {
        log.info("Attempting to fetch all the events - Cache miss, loading from DB");
        List<Events> events = eventRepository.findAll();
        return toList(events);
    }

    @Cacheable(value = CacheConfig.MY_EVENTS, key = "#prn")
    public List<EventResponse> getMyEvents(String prn) {
        log.info("Attempting to fetch all the events created by PRN: {} - Cache miss, loading from DB", prn);
        List<Events> events = eventRepository.findByEventCreator(prn);
        return toList(events);
    }

    @Cacheable(value = CacheConfig.EVENT_BY_ID, key = "#eventId")
    public EventResponse getEventById(Long eventId) {
        log.info("Attempting to fetch event with ID: {} - Cache miss, loading from DB", eventId);
        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event", eventId.toString()));
        ProfileResponse resp = profileManagementServiceClient
                .getProfileByPrn(event.getEventCreator());
        List<Long> targetIds = targetDataRepository
                .findByEvents_EventId(eventId)
                .stream()
                .map(TargetData::getTargetId)
                .toList();
        Ratings ratings = ratingsRepository.findByEvent(event);
        EventResponse response = EventMapper.toResponse(event, event.getEventCreator(), resp.getFullName(), targetIds, ratings);
        log.info("{}", response);
        return response;
    }

    @Cacheable(value = CacheConfig.TARGET_TYPES, key = "'all'")
    public List<String> getAllTargetTypes() {
        log.info("Attempting to fetch all the target types - Cache miss, loading from DB");
        return Arrays.stream(TargetType.values())
                .map(Enum::name)
                .toList();
    }

    @Cacheable(value = CacheConfig.EVENTS_BY_TARGET_TYPE, key = "#targetType")
    public List<EventResponse> getByTargetType(TargetType targetType) {
        log.info("Attempting to fetch events with target type: {} - Cache miss, loading from DB", targetType);
        List<Events> events = eventRepository.findByTarget(targetType);
        return toList(events);
    }

    @Cacheable(value = CacheConfig.EVENTS_BY_CREATOR, key = "#prn")
    public List<EventResponse> getByEventCreator(String prn) {
        log.info("Attempting to fetch events for prn: {} - Cache miss, loading from DB", prn);
        List<Events> events = eventRepository.findByEventCreator(prn);
        if (events.isEmpty()) {
            log.info("No events found");
            return List.of();
        }
        log.info("Found {} events", events.size());
        return toList(events);
    }

    @Cacheable(value = CacheConfig.EVENTS_BY_ORGANIZER, key = "#organizer")
    public List<EventResponse> getByOrganizer(String organizer) {
        log.info("Attempting to fetch events by organizer: {} - Cache miss, loading from DB", organizer);
        List<Events> events = eventRepository.findByOrganizer(organizer);
        return toList(events);
    }

    @Cacheable(value = CacheConfig.EVENTS_BY_RATING, key = "#rating")
    public List<EventResponse> getByRatings(int rating) {
        log.info("Attempting to fetch events with ratings >= {} - Cache miss, loading from DB", rating);
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        List<Long> eventIds = ratingsRepository.findEventIdsByMinRating(rating);
        if (eventIds.isEmpty()) {
            log.info("No events found with rating >= {}", rating);
            return List.of();
        }
        List<Events> events = eventRepository.findAllById(eventIds);
        return toList(events);
    }

    @Cacheable(value = CacheConfig.EVENTS_BY_TARGET_DATA, key = "#type + '_' + #targetId")
    public List<EventResponse> getByTargetData(TargetType type, Long targetId) {
        log.info("Attempting to fetch events for {} with ID: {} - Cache miss, loading from DB", type, targetId);
        if (type == TargetType.GLOBAL) {
            log.info("Fetching GLOBAL events");
            return getByTargetType(TargetType.GLOBAL);
        }
        List<TargetData> targetDataList =
                targetDataRepository.findByTargetTypeAndTargetId(type, targetId);
        if (targetDataList.isEmpty()) {
            log.info("No events found for {} with ID {}", type, targetId);
            return List.of();
        }
        List<Events> events = targetDataList.stream()
                .map(TargetData::getEvents)
                .distinct()
                .toList();
        return toList(events);
    }

    @Cacheable(value = CacheConfig.EVENTS_BY_STATUS, key = "#status")
    public List<EventResponse> getByStatus(boolean status) {
        log.info("Attempting to fetch events where isCompleted = {} - Cache miss, loading from DB", status);
        List<Events> events = eventRepository.findByIsCompleted(status);
        if (events.isEmpty()) {
            log.info("No events found with isCompleted = {}", status);
            return List.of();
        }
        return toList(events);
    }

    @Cacheable(value = CacheConfig.EVENTS_BY_ENROLLMENT_STATUS, key = "#status")
    public List<EventResponse> getByEnrollmentStatus(String status) {
        log.info("Attempting to fetch events where deadline is = {} - Cache miss, loading from DB", status);
        String sanitizedStatus = EventMapper.sanitizeName(status);
        List<Events> events = eventRepository.findByEnrollmentStatus(sanitizedStatus);
        if (events.isEmpty()) {
            log.info("No events found with deadline = {}", sanitizedStatus);
            return List.of();
        }
        return toList(events);
    }

    // ── Read (Paginated — new additions) ─────────────────────────────────────────

    // 1. getAllEvents paged
    @Cacheable(value = CacheConfig.ALL_EVENTS, key = "'all_p' + #pageable.pageNumber + '_s' + #pageable.pageSize")
    public PageResponse<EventResponse> getAllPaged(Pageable pageable) {
        log.info("Fetching all events paged - page: {}, size: {} - Cache miss, loading from DB",
                pageable.getPageNumber(), pageable.getPageSize());
        Page<Events> page = eventRepository.findAll(pageable);
        return PageResponse.from(toPage(page, pageable));
    }

    // 2. getMyEvents paged
    @Cacheable(value = CacheConfig.MY_EVENTS, key = "#prn + '_p' + #pageable.pageNumber + '_s' + #pageable.pageSize")
    public PageResponse<EventResponse> getMyEventsPaged(String prn, Pageable pageable) {
        log.info("Fetching paged events for PRN: {} - page: {}, size: {} - Cache miss, loading from DB",
                prn, pageable.getPageNumber(), pageable.getPageSize());
        Page<Events> page = eventRepository.findByEventCreator(prn, pageable);
        return PageResponse.from(toPage(page, pageable));
    }

    // 3. getByTargetType paged
    @Cacheable(value = CacheConfig.EVENTS_BY_TARGET_TYPE, key = "#targetType + '_p' + #pageable.pageNumber + '_s' + #pageable.pageSize")
    public PageResponse<EventResponse> getByTargetTypePaged(TargetType targetType, Pageable pageable) {
        log.info("Fetching paged events for targetType: {} - page: {}, size: {} - Cache miss, loading from DB",
                targetType, pageable.getPageNumber(), pageable.getPageSize());
        Page<Events> page = eventRepository.findByTarget(targetType, pageable);
        return PageResponse.from(toPage(page, pageable));
    }

    // 4. getByEventCreator paged
    @Cacheable(value = CacheConfig.EVENTS_BY_CREATOR, key = "#prn + '_p' + #pageable.pageNumber + '_s' + #pageable.pageSize")
    public PageResponse<EventResponse> getByEventCreatorPaged(String prn, Pageable pageable) {
        log.info("Fetching paged events for creator PRN: {} - page: {}, size: {} - Cache miss, loading from DB",
                prn, pageable.getPageNumber(), pageable.getPageSize());
        Page<Events> page = eventRepository.findByEventCreator(prn, pageable);
        return PageResponse.from(toPage(page, pageable));
    }

    // 5. getByOrganizer paged
    @Cacheable(value = CacheConfig.EVENTS_BY_ORGANIZER, key = "#organizer + '_p' + #pageable.pageNumber + '_s' + #pageable.pageSize")
    public PageResponse<EventResponse> getByOrganizerPaged(String organizer, Pageable pageable) {
        log.info("Fetching paged events by organizer: {} - page: {}, size: {} - Cache miss, loading from DB",
                organizer, pageable.getPageNumber(), pageable.getPageSize());
        Page<Events> page = eventRepository.findByOrganizer(organizer, pageable);
        return PageResponse.from(toPage(page, pageable));
    }

    // 6. getByRatings paged
    @Cacheable(value = CacheConfig.EVENTS_BY_RATING, key = "#rating + '_p' + #pageable.pageNumber + '_s' + #pageable.pageSize")
    public PageResponse<EventResponse> getByRatingsPaged(int rating, Pageable pageable) {
        log.info("Fetching paged events with ratings >= {} - page: {}, size: {} - Cache miss, loading from DB",
                rating, pageable.getPageNumber(), pageable.getPageSize());
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        List<Long> eventIds = ratingsRepository.findEventIdsByMinRating(rating);
        if (eventIds.isEmpty()) {
            log.info("No events found with rating >= {}", rating);
            return emptyPageResponse(pageable);
        }
        Page<Events> page = eventRepository.findAllByEventIdIn(eventIds, pageable);
        return PageResponse.from(toPage(page, pageable));
    }

    // 7. getByTargetData paged
    @Cacheable(value = CacheConfig.EVENTS_BY_TARGET_DATA, key = "#type + '_' + #targetId + '_p' + #pageable.pageNumber + '_s' + #pageable.pageSize")
    public PageResponse<EventResponse> getByTargetDataPaged(TargetType type, Long targetId, Pageable pageable) {
        log.info("Fetching paged events for {} with ID: {} - page: {}, size: {} - Cache miss, loading from DB",
                type, targetId, pageable.getPageNumber(), pageable.getPageSize());
        if (type == TargetType.GLOBAL) {
            log.info("Fetching GLOBAL events paged");
            return getByTargetTypePaged(TargetType.GLOBAL, pageable);
        }
        List<TargetData> targetDataList =
                targetDataRepository.findByTargetTypeAndTargetId(type, targetId);
        if (targetDataList.isEmpty()) {
            log.info("No events found for {} with ID {}", type, targetId);
            return emptyPageResponse(pageable);
        }
        List<Long> eventIds = targetDataList.stream()
                .map(td -> td.getEvents().getEventId())
                .distinct()
                .collect(Collectors.toList());
        Page<Events> page = eventRepository.findAllByEventIdIn(eventIds, pageable);
        return PageResponse.from(toPage(page, pageable));
    }

    // 8. getByStatus paged
    @Cacheable(value = CacheConfig.EVENTS_BY_STATUS, key = "#status + '_p' + #pageable.pageNumber + '_s' + #pageable.pageSize")
    public PageResponse<EventResponse> getByStatusPaged(boolean status, Pageable pageable) {
        log.info("Fetching paged events where isCompleted = {} - page: {}, size: {} - Cache miss, loading from DB",
                status, pageable.getPageNumber(), pageable.getPageSize());
        Page<Events> page = eventRepository.findByIsCompleted(status, pageable);
        return PageResponse.from(toPage(page, pageable));
    }

    // 9. getByEnrollmentStatus paged
    @Cacheable(value = CacheConfig.EVENTS_BY_ENROLLMENT_STATUS, key = "#status + '_p' + #pageable.pageNumber + '_s' + #pageable.pageSize")
    public PageResponse<EventResponse> getByEnrollmentStatusPaged(String status, Pageable pageable) {
        log.info("Fetching paged events with enrollmentStatus = {} - page: {}, size: {} - Cache miss, loading from DB",
                status, pageable.getPageNumber(), pageable.getPageSize());
        String sanitizedStatus = EventMapper.sanitizeName(status);
        Page<Events> page = eventRepository.findByEnrollmentStatus(sanitizedStatus, pageable);
        return PageResponse.from(toPage(page, pageable));
    }

    // ── Update ──────────────────────────────────────────────────────────────────

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.EVENT_BY_ID, key = "#eventId"),
            @CacheEvict(value = CacheConfig.ALL_EVENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.MY_EVENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_TYPE, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_CREATOR, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ORGANIZER, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_DATA, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_STATUS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ENROLLMENT_STATUS, allEntries = true)
    })
    public EventResponse markEventAsCompleted(Long eventId, String prn, String role) {
        log.info("Attempting to update event status to complete with ID: {}", eventId);
        Events event = eventRepository.findById(eventId).orElseThrow(
                () -> new NotFoundException("Event", eventId.toString())
        );
        if (!role.equals("SUPER_ADMIN") && !prn.equals(event.getEventCreator())) {
            log.warn("User {} with role {} is not allowed to change the status of event created by {}",
                    prn, role, event.getEventCreator());
            throw new ServiceException("You are not allowed to change the status of the event");
        }
        event.complete();
        Events saved = eventRepository.save(event);
        ProfileResponse profile = profileManagementServiceClient.getProfileByPrn(prn);
        List<Long> targetIds = targetDataRepository
                .findByEvents_EventId(saved.getEventId())
                .stream()
                .map(TargetData::getTargetId)
                .toList();
        Ratings ratings = ratingsRepository.findByEvent(event);
        return EventMapper.toResponse(saved, saved.getEventCreator(), profile.getFullName(), targetIds, ratings);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.EVENT_BY_ID, key = "#eventId"),
            @CacheEvict(value = CacheConfig.ALL_EVENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.MY_EVENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_TYPE, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_CREATOR, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ORGANIZER, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_STATUS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ENROLLMENT_STATUS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENT_COUNT_BY_CLUB, allEntries = true)
    })
    public EventResponse updateEvent(Long eventId, UpdateEventRequest request, String prn, String role) {
        log.info("Attempting to update event with ID: {} by {}", eventId, prn);
        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event", eventId.toString()));
        if (!event.getEventCreator().equals(prn) && !"SUPER_ADMIN".equals(role)) {
            throw new ServiceException("You are not allowed to update this event");
        }
        if (event.isCompleted()) {
            throw new ServiceException("Cannot update a completed event");
        }
        if (request.getAttendanceWindowStart() != null && request.getAttendanceWindowEnd() != null) {
            if (request.getAttendanceWindowStart().isAfter(request.getAttendanceWindowEnd())) {
                throw new ServiceException("Attendance window start must be before end time");
            }
        }
        if (request.getEventDate() != null && request.getEnrollmentDeadline() != null) {
            if (request.getEnrollmentDeadline().isAfter(request.getEventDate())) {
                throw new ServiceException("Enrollment deadline must be before event date");
            }
        }
        if (request.getTitle() != null) event.setTitle(request.getTitle());
        if (request.getDescription() != null) event.setDescription(request.getDescription());
        if (request.getSpeakerName() != null) event.setSpeakerName(request.getSpeakerName());
        if (request.getVenue() != null) event.setVenue(request.getVenue());
        if (request.getOrganizer() != null) event.setOrganizer(request.getOrganizer());
        if (request.getEventDate() != null) event.setEventDate(request.getEventDate());
        if (request.getEnrollmentDeadline() != null) event.setEnrollmentDeadline(request.getEnrollmentDeadline());
        if (request.getMaxEnrollments() != null) event.setMaxEnrollments(request.getMaxEnrollments());
        if (request.getLatitude() != null) event.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) event.setLongitude(request.getLongitude());
        if (request.getRadiusInMeters() != null) event.setRadiusInMeters(request.getRadiusInMeters());
        if (request.getAttendanceWindowStart() != null)
            event.setAttendanceWindowStart(request.getAttendanceWindowStart());
        if (request.getAttendanceWindowEnd() != null) event.setAttendanceWindowEnd(request.getAttendanceWindowEnd());
        if (request.getQrRefreshInterval() != null) event.setQrRefreshIntervalSeconds(request.getQrRefreshInterval());
        Events saved = eventRepository.save(event);
        ProfileResponse profile = profileManagementServiceClient.getProfileByPrn(prn);
        List<Long> targetIds = targetDataRepository
                .findByEvents_EventId(saved.getEventId())
                .stream()
                .map(TargetData::getTargetId)
                .toList();
        log.info("Event {} updated successfully by {}", eventId, prn);
        Ratings ratings = ratingsRepository.findByEvent(event);
        return EventMapper.toResponse(saved, saved.getEventCreator(), profile.getFullName(), targetIds, ratings);
    }

    // ── Delete ──────────────────────────────────────────────────────────────────

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.EVENT_BY_ID, key = "#eventId"),
            @CacheEvict(value = CacheConfig.ALL_EVENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.MY_EVENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_TYPE, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_CREATOR, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ORGANIZER, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_RATING, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_DATA, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_STATUS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ENROLLMENT_STATUS, allEntries = true),
            @CacheEvict(value = CacheConfig.MY_ENROLLMENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.MY_ENROLLED_EVENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.ENROLLMENTS_FOR_EVENT, key = "#eventId"),
            @CacheEvict(value = CacheConfig.EVENT_COUNT_BY_CLUB, allEntries = true)
    })
    public void deleteById(Long eventId) {
        log.info("Attempting to delete event with ID: {}", eventId);
        eventEnrollmentRepository.deleteByEvent_EventId(eventId);
        targetDataRepository.deleteByEvents_EventId(eventId);
        ratingsRepository.deleteByEvent_EventId(eventId);
        eventRepository.deleteById(eventId);
    }

    @Caching(evict = {
            @CacheEvict(value = CacheConfig.EVENT_BY_ID, key = "#req.eventId"),
            @CacheEvict(value = CacheConfig.ALL_EVENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.MY_EVENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_TYPE, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_CREATOR, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ORGANIZER, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_RATING, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_DATA, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_STATUS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ENROLLMENT_STATUS, allEntries = true),
            @CacheEvict(value = CacheConfig.MY_ENROLLMENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.MY_ENROLLED_EVENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.ENROLLMENTS_FOR_EVENT, key = "#req.eventId")
    })
    @Transactional
    public void restartEnrollment(RestartEnrollmentRequest req) {
        log.info("Attempting to re-start enrollment time");

        Events event = eventRepository.findById(req.getEventId()).orElseThrow(
                () -> new NotFoundException("Events", req.getEventId().toString())
        );

        if(event.isCompleted() || LocalDateTime.now().isAfter(event.getEventDate())){
            throw new ServiceException("Either the event is completed or the event is already started");
        }

        event.setEnrollmentStatus("OPEN");
        event.setEnrollmentDeadline(req.getEnrollmentDeadline());

        eventRepository.save(event);
    }

    @Cacheable(value = CacheConfig.EVENT_COUNT_BY_CLUB, key = "'all'")
    public Map<Long, Integer> getEventCountForClub() {
        log.info("Fetching event count per club - Cache miss, loading from DB");

        List<ClubResponse> clubResponses = clubServiceClient.getAllClubs();

        // Single aggregated DB query — no full table scan
        Map<String, Integer> countByOrganizerName = eventRepository
                .countEventsByOrganizer()
                .stream()
                .collect(Collectors.toMap(
                        row -> ((String) row[0]),
                        row -> ((Long) row[1]).intValue(),
                        Integer::sum
                ));

        Map<Long, Integer> eventCountByClub = new HashMap<>();

        clubResponses.forEach(club -> {
            eventCountByClub.put(
                    club.getClubId(),
                    countByOrganizerName.getOrDefault(club.getClubName(), 0)
            );
        });

        return eventCountByClub;
    }

    // ── Private Helpers ─────────────────────────────────────────────────────────

    private Map<String, ProfileResponse> fetchProfilesMap(List<String> prns) {
        try {
            List<ProfileResponse> profiles = profileManagementServiceClient.getProfilesByPrns(prns);
            return profiles.stream()
                    .collect(Collectors.toMap(
                            ProfileResponse::getPrn,
                            profile -> profile,
                            (existing, replacement) -> existing
                    ));
        } catch (Exception e) {
            log.error("Error batch fetching profiles: {}", e.getMessage());
            return Map.of();
        }
    }

    /**
     * Converts a Page<Events> into a Page<EventResponse> by batch-fetching
     * profiles and target data for only the current page's events.
     */
    private Page<EventResponse> toPage(Page<Events> eventsPage, Pageable pageable) {
        List<Events> events = eventsPage.getContent();
        if (events.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, eventsPage.getTotalElements());
        }

        List<String> creatorPrns = events.stream()
                .map(Events::getEventCreator)
                .distinct()
                .collect(Collectors.toList());

        Map<String, ProfileResponse> profileMap = fetchProfilesMap(creatorPrns);

        List<Long> eventIds = events.stream()
                .map(Events::getEventId)
                .collect(Collectors.toList());

        List<TargetData> allTargetData = targetDataRepository.findByEvents_EventIdIn(eventIds);

        Map<Long, List<Long>> targetIdsMap = allTargetData.stream()
                .collect(Collectors.groupingBy(
                        td -> td.getEvents().getEventId(),
                        Collectors.mapping(TargetData::getTargetId, Collectors.toList())
                ));

        // ── Batch fetch ratings (fixes N+1) ────────────────────────────────────
        List<Ratings> ratingsList = ratingsRepository.findByEvent_EventIdIn(eventIds);

        Map<Long, Ratings> ratingByEventId = ratingsList.stream()
                .collect(Collectors.toMap(
                        r -> r.getEvent().getEventId(),
                        Function.identity()
                ));
        // ───────────────────────────────────────────────────────────────────────

        List<EventResponse> responses = events.stream()
                .map(event -> {
                    ProfileResponse profile = profileMap.get(event.getEventCreator());
                    String creatorName = profile != null ? profile.getFullName() : event.getEventCreator();
                    List<Long> targetIds = targetIdsMap.getOrDefault(event.getEventId(), List.of());
                    Ratings ratings = ratingByEventId.get(event.getEventId()); // batch lookup
                    return EventMapper.toResponse(event, event.getEventCreator(), creatorName, targetIds, ratings);
                })
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, eventsPage.getTotalElements());
    }

    /**
     * Returns an empty PageResponse without hitting the DB.
     */
    private PageResponse<EventResponse> emptyPageResponse(Pageable pageable) {
        return PageResponse.<EventResponse>builder()
                .content(List.of())
                .pageNumber(pageable.getPageNumber())
                .pageSize(pageable.getPageSize())
                .totalElements(0)
                .totalPages(0)
                .last(true)
                .build();
    }

    public List<EventResponse> toList(List<Events> events) {
        if (events.isEmpty()) {
            log.info("No events found");
            return List.of();
        }
        log.info("Found {} events", events.size());
        List<String> creatorPrns = events.stream()
                .map(Events::getEventCreator)
                .distinct()
                .collect(Collectors.toList());

        log.info("Fetching profiles for {} unique creators", creatorPrns.size());

        Map<String, ProfileResponse> profileMap = fetchProfilesMap(creatorPrns);

        List<Long> eventIds = events.stream()
                .map(Events::getEventId)
                .collect(Collectors.toList());

        List<TargetData> allTargetData = targetDataRepository.findByEvents_EventIdIn(eventIds);

        Map<Long, List<Long>> targetIdsMap = allTargetData.stream()
                .collect(Collectors.groupingBy(
                        td -> td.getEvents().getEventId(),
                        Collectors.mapping(TargetData::getTargetId, Collectors.toList())
                ));

        List<Ratings> ratings = ratingsRepository.findByEvent_EventIdIn(eventIds);

        Map<Long, Ratings> ratingByEventId = ratings.stream()
                .collect(Collectors.toMap(
                        r -> r.getEvent().getEventId(),
                        Function.identity()
                ));

        return events.stream()
                .map(event -> {
                    ProfileResponse profile = profileMap.get(event.getEventCreator());

                    String eventCreatorName = profile != null
                            ? profile.getFullName()
                            : event.getEventCreator();

                    List<Long> targetIds = targetIdsMap.getOrDefault(event.getEventId(), List.of());

                    Ratings rating = ratingByEventId.get(event.getEventId());

                    return EventMapper.toResponse(
                            event,
                            event.getEventCreator(),
                            eventCreatorName,
                            targetIds,
                            rating
                    );
                })
                .collect(Collectors.toList());
    }
}