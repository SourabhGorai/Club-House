package com.clubHouse.event_service2.service;

import com.clubHouse.event_service2.client.ProfileManagementServiceClient;
import com.clubHouse.event_service2.config.CacheConfig;
import com.clubHouse.event_service2.dto.response.CompleteEnrollmentResponse;
import com.clubHouse.event_service2.dto.response.EnrollmentResponse;
import com.clubHouse.event_service2.dto.response.EventResponse;
import com.clubHouse.event_service2.dto.response.ProfileResponse;
import com.clubHouse.event_service2.exception.NotFoundException;
import com.clubHouse.event_service2.exception.ServiceException;
import com.clubHouse.event_service2.mapper.EnrollmentMapper;
import com.clubHouse.event_service2.model.EventEnrollment;
import com.clubHouse.event_service2.model.Events;
import com.clubHouse.event_service2.repository.EventEnrollmentRepository;
import com.clubHouse.event_service2.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventEnrollmentService {

    private final EventEnrollmentRepository enrollmentRepository;
    private final EventRepository eventRepository;
    private final EventService eventService;
    private final EnrollmentMapper enrollmentMapper;
    private final ProfileManagementServiceClient profileManagementServiceClient;

    @Caching(evict = {
            @CacheEvict(value = CacheConfig.MY_ENROLLMENTS, key = "#prn"),
            @CacheEvict(value = CacheConfig.MY_ENROLLED_EVENTS, key = "#prn"),
            @CacheEvict(value = CacheConfig.ENROLLMENTS_FOR_EVENT, key = "#eventId"),
            // ADDED: Evict EVENT_BY_ID cache because currEnrollments changed
            @CacheEvict(value = CacheConfig.EVENT_BY_ID, key = "#eventId"),
            // ADDED: Evict list caches that include enrollment counts
            @CacheEvict(value = CacheConfig.ALL_EVENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_TYPE, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_CREATOR, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ORGANIZER, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_DATA, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_STATUS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ENROLLMENT_STATUS, allEntries = true)
    })
    @Transactional
    public EnrollmentResponse enrollMe(Long eventId, String prn) throws ServiceException {

        log.info("Attempting to enroll {} in event with ID {}", prn, eventId);

        Optional<EventEnrollment> exists = enrollmentRepository.findByEvent_EventIdAndPrn(eventId, prn);

        if (exists.isPresent()) {
            log.warn("User {} is already enrolled in event {}", prn, eventId);
            return EnrollmentMapper.toResponse(exists.get(), prn);
        }

        Events event = eventRepository.findById(eventId).orElseThrow(
                () -> new NotFoundException("Events", eventId.toString())
        );

        // Check enrollment capacity
        if (event.getMaxEnrollments() != null &&
                event.getCurrEnrollments() >= event.getMaxEnrollments()) {
            log.info("Event {} is full. Current: {}, Max: {}",
                    eventId, event.getCurrEnrollments(), event.getMaxEnrollments());
            throw new ServiceException("Seats are full.");
        }

        EventEnrollment newEnrollment = EventEnrollment.builder()
                .prn(prn)
                .event(event)
                .build();

        EventEnrollment saved = enrollmentRepository.save(newEnrollment);

        // Increment enrollment count
        event.setCurrEnrollments(event.getCurrEnrollments() + 1);
        eventRepository.save(event);

        log.info("Successfully enrolled {} in event {}. Current enrollments: {}/{}",
                prn, eventId, event.getCurrEnrollments(), event.getMaxEnrollments());

        return EnrollmentMapper.toResponse(saved, prn);
    }

    @Cacheable(value = CacheConfig.MY_ENROLLMENTS, key = "#prn")
    public List<EnrollmentResponse> getMyAllEnrollments(String prn) {

        log.info("Attempting to fetch all the enrollments of prn: {} - Cache miss, loading from DB", prn);

        List<EventEnrollment> resp = enrollmentRepository.findByPrn(prn);

        return EnrollmentMapper.toResponseList(resp, prn);

    }

    @Cacheable(value = CacheConfig.MY_ENROLLED_EVENTS, key = "#prn")
    public Map<EventResponse, String> getMyEnrolledEvents(String prn) {

        log.info("Attempting to fetch events in which I have enrolled till date - Cache miss, loading from DB");

        List<EventEnrollment> enrollments = enrollmentRepository.findByPrn(prn);

        if (enrollments.isEmpty()) {
            log.info("No enrollments found");
            return Map.of();
        }

        List<Events> events = enrollments.stream()
                .map(EventEnrollment::getEvent)
                .toList();

        List<EventResponse> respList = eventService.toList(events);

        Map<EventResponse, String> finalResp = new HashMap<>();

        for (int i = 0; i < enrollments.size(); i++) {
            String formattedTime =
                    EnrollmentMapper.format(enrollments.get(i).getCreatedAt());

            finalResp.put(respList.get(i), formattedTime);
        }

        return finalResp;
    }

    @Cacheable(value = CacheConfig.ENROLLMENTS_FOR_EVENT, key = "#eventId")
    public List<CompleteEnrollmentResponse> getForEvent(Long eventId) {

        log.info("Attempting to fetch all enrolled users for event id: {} - Cache miss, loading from DB", eventId);

        List<EventEnrollment> enrollments = enrollmentRepository.findByEvent_EventId(eventId);

        if (enrollments.isEmpty()) {
            return List.of();
        }

        List<String> prns = enrollments.stream()
                .map(EventEnrollment::getPrn)
                .distinct()
                .toList();

        List<ProfileResponse> profiles =
                profileManagementServiceClient.getProfilesByPrns(prns);

        Map<String, ProfileResponse> profileMap = profiles.stream()
                .collect(Collectors.toMap(
                        ProfileResponse::getPrn,
                        p -> p,
                        (a, b) -> a
                ));

        return enrollments.stream()
                .map(enrollment -> {
                    ProfileResponse profile = profileMap.get(enrollment.getPrn());

                    return CompleteEnrollmentResponse.builder()
                            .enrollmentId(enrollment.getEnrollmentId())
                            .eventId(enrollment.getEvent().getEventId())
                            .prn(enrollment.getPrn())
                            .createdAt(EnrollmentMapper.format(enrollment.getCreatedAt()))
                            .name(profile != null ? profile.getFullName() : null)
                            .year(profile != null && profile.getYear() != null
                                    ? profile.getYear().toString()
                                    : null)
                            .department(profile != null ? profile.getDepartment() : null)
                            .build();
                })
                .toList();
    }

    @Caching(evict = {
            @CacheEvict(value = CacheConfig.MY_ENROLLMENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.MY_ENROLLED_EVENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.ENROLLMENTS_FOR_EVENT, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENT_BY_ID, allEntries = true),
            @CacheEvict(value = CacheConfig.ALL_EVENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_TYPE, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_CREATOR, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ORGANIZER, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_DATA, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_STATUS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ENROLLMENT_STATUS, allEntries = true)
    })
    @Transactional
    public void revokeMyEnrollment(Long eventId, String prn) {

        log.info("Attempting to delete enrollment with prn: {}, eventId: {}", prn, eventId);

        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Enrollment", eventId.toString()));

        // Decrement enrollment count (with safety check)
        if (event.getCurrEnrollments() > 0) {
            event.setCurrEnrollments(event.getCurrEnrollments() - 1);
            eventRepository.save(event);
            log.info("Decremented enrollment count for event {}. Current: {}",
                    event.getEventId(), event.getCurrEnrollments());
        } else {
            log.warn("Event {} already has 0 enrollments, cannot decrement", event.getEventId());
        }

        enrollmentRepository.deleteByPrnAndEvent_EventId(prn, eventId);

    }

    @Caching(evict = {
            @CacheEvict(value = CacheConfig.MY_ENROLLMENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.MY_ENROLLED_EVENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.ENROLLMENTS_FOR_EVENT, key = "#eventId"),
            @CacheEvict(value = CacheConfig.EVENT_BY_ID, key = "#eventId"),
            @CacheEvict(value = CacheConfig.ALL_EVENTS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_TYPE, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_CREATOR, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ORGANIZER, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_TARGET_DATA, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_STATUS, allEntries = true),
            @CacheEvict(value = CacheConfig.EVENTS_BY_ENROLLMENT_STATUS, allEntries = true)
    })
    @Transactional
    public void revokeEnrollmentsOfEvent(Long eventId) {
        log.info("Attempting to delete all the enrollments with event id: {}", eventId);

        enrollmentRepository.deleteByEvent_EventId(eventId);

        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event", eventId.toString()));

        event.setCurrEnrollments(0);
        eventRepository.save(event);

        log.info("Reset enrollment count to 0 for event {}", eventId);
    }


}