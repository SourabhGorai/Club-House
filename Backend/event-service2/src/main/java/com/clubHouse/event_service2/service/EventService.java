package com.clubHouse.event_service2.service;

import com.clubHouse.event_service2.client.ProfileManagementServiceClient;
import com.clubHouse.event_service2.dto.EventRequest;
import com.clubHouse.event_service2.dto.EventResponse;
import com.clubHouse.event_service2.dto.ProfileResponse;
import com.clubHouse.event_service2.mapper.EventMapper;
import com.clubHouse.event_service2.model.Events;
import com.clubHouse.event_service2.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventService {

    private final EventRepository eventRepository;
    private final ProfileManagementServiceClient profileManagementServiceClient;

    public EventResponse createEvent(EventRequest req, String prn) {

        log.info("Attempting to create event for PRN: {}", prn);

        Events events = Events.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .speakerName(req.getSpeakerName())
                .eventDate(req.getEventDate())
                .organizer(prn)
                .venue(req.getVenue())
                .target(req.getTarget())
                .build();

        Events saved = eventRepository.save(events);

        ProfileResponse profile = profileManagementServiceClient.getProfileByPrn(prn);

        return EventMapper.toResponse(saved, prn, profile.getFullName());

    }

    public List<EventResponse> getAll() {

        log.info("Attempting to fetch all the events");

        List<Events> events = eventRepository.findAll();

        if (events.isEmpty()) {
            log.info("No events found");
            return List.of();
        }

        log.info("Found {} events", events.size());

        // Extract unique organizer PRNs
        List<String> organizerPrns = events.stream()
                .map(Events::getOrganizer)
                .distinct()
                .collect(Collectors.toList());

        log.info("Fetching profiles for {} unique organizers", organizerPrns.size());

        // Batch fetch all profiles at once
        Map<String, ProfileResponse> profileMap = fetchProfilesMap(organizerPrns);

        // Map events to responses
        return events.stream()
                .map(event -> {
                    ProfileResponse profile = profileMap.get(event.getOrganizer());
                    String organizerName = profile != null
                            ? profile.getFullName()
                            : event.getOrganizer(); // Fallback to PRN

                    return EventMapper.toResponse(
                            event,
                            event.getOrganizer(),
                            organizerName
                    );
                })
                .collect(Collectors.toList());
    }

    public List<EventResponse> getMyEvents(String prn) {

        log.info("Attempting to fetch all the events created by PRN: {}", prn);

        List<Events> events = eventRepository.findByOrganizer(prn);
        ProfileResponse profile =

        return EventMapper.toResponseList(events, prn, );

    }

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
}
