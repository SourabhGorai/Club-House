package com.clubHouse.event_service2.service;

import com.clubHouse.event_service2.client.ProfileManagementServiceClient;
import com.clubHouse.event_service2.dto.EventRequest;
import com.clubHouse.event_service2.dto.EventResponse;
import com.clubHouse.event_service2.dto.ProfileResponse;
import com.clubHouse.event_service2.exception.NotFoundException;
import com.clubHouse.event_service2.mapper.EventMapper;
import com.clubHouse.event_service2.model.Events;
import com.clubHouse.event_service2.model.Ratings;
import com.clubHouse.event_service2.model.TargetData;
import com.clubHouse.event_service2.model.TargetType;
import com.clubHouse.event_service2.repository.EventRepository;
import com.clubHouse.event_service2.repository.RatingsRepository;
import com.clubHouse.event_service2.repository.TargetDataRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @Transactional
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
                .target(targetType)
                .build();

        Events saved = eventRepository.save(events);
        ratingsRepository.save(
                Ratings.builder()
                        .eventId(saved.getEventId())
                        .build()
        );

        if ((req.getTarget() == TargetType.CLUB || req.getTarget() == TargetType.DEPARTMENT)
                && req.getTargetIds() != null && !req.getTargetIds().isEmpty()) {

//            Events event = eventRepository.findById(saved.getEventId())
//                    .orElseThrow(() ->
//                            new NotFoundException("Event", saved.getEventId().toString())
//                    );

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

    public List<EventResponse> getAll() {

        log.info("Attempting to fetch all the events");

        List<Events> events = eventRepository.findAll();

        return toList(events);

    }

    public List<EventResponse> getMyEvents(String prn) {

        log.info("Attempting to fetch all the events created by PRN: {}", prn);

        List<Events> events = eventRepository.findByEventCreator(prn);
        ProfileResponse profile = profileManagementServiceClient.getProfileByPrn(prn);

        return EventMapper.toResponseList(events, prn, profile.getFullName());

    }

    public EventResponse getEventById(Long eventId) {

        log.info("Attempting to fetch event with ID: {}", eventId);

        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event", eventId.toString()));

        ProfileResponse resp = profileManagementServiceClient
                .getProfileByPrn(event.getEventCreator());

        return EventMapper.toResponse(event, event.getEventCreator(), resp.getFullName());

    }

    public List<String> getAllTargetTypes() {

        log.info("Attempting to fetch all the target types");

        return Arrays.stream(TargetType.values())
                .map(Enum::name)
                .toList();
    }

    public List<EventResponse> getByTargetType(TargetType targetType) {

        log.info("Attempting to fetch events with target type: {}", targetType);

        List<Events> events = eventRepository.findByTarget(targetType);

        return toList(events);

    }

    public List<EventResponse> getByEventCreator(String prn) {

        log.info("Attempting to fetch events for prn: {}", prn);

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

    public List<EventResponse> getByOrganizer(String organizer) {

        log.info("Attempting to fetch ");

        List<Events> events = eventRepository.findByOrganizer(organizer);

        return toList(events);

    }

    public List<EventResponse> getByRatings(int rating) {

        log.info("Attempting to fetch events with ratings >= {}", rating);

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

    public List<EventResponse> getByTargetData(TargetType type, Long targetId) {

        log.info("Attempting to fetch events for {} with ID: {}", type, targetId);

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

    // ==================================================================================== //

    /**
     * Fetch multiple profiles and return as a Map for quick lookup
     */
    private Map<String, ProfileResponse> fetchProfilesMap(List<String> prns) {
        try {
            // You'll need to add this batch endpoint to your ProfileManagementServiceClient
            List<ProfileResponse> profiles = profileManagementServiceClient.getProfilesByPrns(prns);

            return profiles.stream()
                    .collect(Collectors.toMap(
                            ProfileResponse::getPrn,
                            profile -> profile,
                            (existing, replacement) -> existing
                    ));
        } catch (Exception e) {
            log.error("Error batch fetching profiles: {}", e.getMessage());
            return Map.of(); // Return empty map on error
        }
    }

    public List<EventResponse> toList(List<Events> events){

        if (events.isEmpty()) {
            log.info("No events found");
            return List.of();
        }

        log.info("Found {} events", events.size());

        // Extract unique organizer PRNs
        List<String> creatorPrns = events.stream()
                .map(Events::getEventCreator)
                .distinct()
                .collect(Collectors.toList());

        log.info("Fetching profiles for {} unique creators", creatorPrns.size());

        // Batch fetch all profiles at once
        Map<String, ProfileResponse> profileMap = fetchProfilesMap(creatorPrns);
//        Map<String, String>

        // Map events to responses
        return events.stream()
                .map(event -> {
                    ProfileResponse profile = profileMap.get(event.getEventCreator());
                    String eventCreatorName = profile != null
                            ? profile.getFullName()
                            : event.getEventCreator(); // Fallback to PRN

                    return EventMapper.toResponse(
                            event,
                            event.getEventCreator(),
                            eventCreatorName
                    );
                })
                .collect(Collectors.toList());

    }



}
