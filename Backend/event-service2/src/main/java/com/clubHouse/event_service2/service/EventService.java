package com.clubHouse.event_service2.service;

import com.clubHouse.event_service2.client.ProfileManagementServiceClient;
import com.clubHouse.event_service2.config.CacheConfig;
import com.clubHouse.event_service2.dto.EventRequest;
import com.clubHouse.event_service2.dto.EventResponse;
import com.clubHouse.event_service2.dto.ProfileResponse;
import com.clubHouse.event_service2.dto.UpdateEventRequest;
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
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
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

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.ALL_EVENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.MY_EVENTS, key = "#prn"),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_TYPE, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_CREATOR, key = "#prn"),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ORGANIZER, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_DATA, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_STATUS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ENROLLMENT_STATUS, allEntries = true)
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
                .currEnrollments(0) // Initialize to 0
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
        ratingsRepository.save(
                Ratings.builder()
                        .eventId(saved.getEventId())
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

        return EventMapper.toResponse(saved, prn, profile.getFullName());

    }

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
        ProfileResponse profile = profileManagementServiceClient.getProfileByPrn(prn);

        return EventMapper.toResponseList(events, prn, profile.getFullName());

    }

    @Cacheable(value = CacheConfig.EVENT_BY_ID, key = "#eventId")
    public EventResponse getEventById(Long eventId) {

        log.info("Attempting to fetch event with ID: {} - Cache miss, loading from DB", eventId);

        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event", eventId.toString()));

        ProfileResponse resp = profileManagementServiceClient
                .getProfileByPrn(event.getEventCreator());

        return EventMapper.toResponse(event, event.getEventCreator(), resp.getFullName());

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

        ProfileResponse profile = profileManagementServiceClient.getProfileByPrn(prn);

        String creatorName = profile.getFullName();

        return events.stream()
                .map(event -> EventMapper.toResponse(
                        event,
                        prn,
                        creatorName
                ))
                .toList();

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

        List<Long> eventIds =
                ratingsRepository.findEventIdsByMinRating(rating);

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

        // GLOBAL events don't need targetData
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

        // FIXED: Changed || to && - user must be EITHER super admin OR event creator
        if(!role.equals("SUPER_ADMIN") && !prn.equals(event.getEventCreator())) {
            log.warn("User {} with role {} is not allowed to change the status of event created by {}",
                    prn, role, event.getEventCreator());
            throw new ServiceException("You are not allowed to change the status of the event");
        }

        event.complete();
        Events saved = eventRepository.save(event);

        ProfileResponse profile = profileManagementServiceClient.getProfileByPrn(prn);

        return EventMapper.toResponse(saved, saved.getEventCreator(), profile.getFullName());

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

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.EVENT_BY_ID, key = "#eventId"),
            @CacheEvict(value = CacheConfig.ALL_EVENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.MY_EVENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_TYPE, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_CREATOR, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ORGANIZER, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_STATUS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ENROLLMENT_STATUS, allEntries = true)
    })
    public EventResponse updateEvent(Long eventId, UpdateEventRequest request, String prn, String role) {

        log.info("Attempting to update event with ID: {} by {}", eventId, prn);

        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event", eventId.toString()));

        // Authorization: only event creator or SUPER_ADMIN
        if (!event.getEventCreator().equals(prn) && !"SUPER_ADMIN".equals(role)) {
            throw new ServiceException("You are not allowed to update this event");
        }

        // Cannot update a completed event
        if (event.isCompleted()) {
            throw new ServiceException("Cannot update a completed event");
        }

        // Validate attendance window if both are provided
        if (request.getAttendanceWindowStart() != null && request.getAttendanceWindowEnd() != null) {
            if (request.getAttendanceWindowStart().isAfter(request.getAttendanceWindowEnd())) {
                throw new ServiceException("Attendance window start must be before end time");
            }
        }

        // Validate event date vs enrollment deadline if both provided
        if (request.getEventDate() != null && request.getEnrollmentDeadline() != null) {
            if (request.getEnrollmentDeadline().isAfter(request.getEventDate())) {
                throw new ServiceException("Enrollment deadline must be before event date");
            }
        }

        // Apply updates — only update fields that are present in the request (partial update support)
        if (request.getTitle() != null)                   event.setTitle(request.getTitle());
        if (request.getDescription() != null)             event.setDescription(request.getDescription());
        if (request.getSpeakerName() != null)             event.setSpeakerName(request.getSpeakerName());
        if (request.getVenue() != null)                   event.setVenue(request.getVenue());
        if (request.getOrganizer() != null)               event.setOrganizer(request.getOrganizer());
        if (request.getEventDate() != null)               event.setEventDate(request.getEventDate());
        if (request.getEnrollmentDeadline() != null)      event.setEnrollmentDeadline(request.getEnrollmentDeadline());
        if (request.getMaxEnrollments() != null)          event.setMaxEnrollments(request.getMaxEnrollments());
        if (request.getLatitude() != null)                event.setLatitude(request.getLatitude());
        if (request.getLongitude() != null)               event.setLongitude(request.getLongitude());
        if (request.getRadiusInMeters() != null)          event.setRadiusInMeters(request.getRadiusInMeters());
        if (request.getAttendanceWindowStart() != null)   event.setAttendanceWindowStart(request.getAttendanceWindowStart());
        if (request.getAttendanceWindowEnd() != null)     event.setAttendanceWindowEnd(request.getAttendanceWindowEnd());
        if (request.getQrRefreshInterval() != null)       event.setQrRefreshIntervalSeconds(request.getQrRefreshInterval());

        Events saved = eventRepository.save(event);

        ProfileResponse profile = profileManagementServiceClient.getProfileByPrn(prn);

        log.info("Event {} updated successfully by {}", eventId, prn);
        return EventMapper.toResponse(saved, saved.getEventCreator(), profile.getFullName());
    }


    // ==================================================================================== //

    /**
     * Fetch multiple profiles and return as a Map for quick lookup
     */
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

    public List<EventResponse> toList(List<Events> events){

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

        return events.stream()
                .map(event -> {
                    ProfileResponse profile = profileMap.get(event.getEventCreator());
                    String eventCreatorName = profile != null
                            ? profile.getFullName()
                            : event.getEventCreator();

                    return EventMapper.toResponse(
                            event,
                            event.getEventCreator(),
                            eventCreatorName
                    );
                })
                .collect(Collectors.toList());

    }

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
            @CacheEvict(value = CacheConfig.ENROLLMENTS_FOR_EVENT, key = "#eventId")
    })
    public void deleteById(Long eventId) {

        log.info("Attempting to delete event with ID: {}", eventId);

        eventEnrollmentRepository.deleteByEvent_EventId(eventId);
        targetDataRepository.deleteByEvents_EventId(eventId);
        ratingsRepository.deleteByEventId(eventId);
        eventRepository.deleteById(eventId);

    }
}