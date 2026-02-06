package com.clubHouse.event_service2.service;

import com.clubHouse.event_service2.client.ProfileManagementServiceClient;
import com.clubHouse.event_service2.dto.CompleteEnrollmentResponse;
import com.clubHouse.event_service2.dto.EnrollmentResponse;
import com.clubHouse.event_service2.dto.EventResponse;
import com.clubHouse.event_service2.dto.ProfileResponse;
import com.clubHouse.event_service2.exception.NotFoundException;
import com.clubHouse.event_service2.exception.ServiceException;
import com.clubHouse.event_service2.mapper.EnrollmentMapper;
import com.clubHouse.event_service2.model.EventEnrollment;
import com.clubHouse.event_service2.model.Events;
import com.clubHouse.event_service2.repository.EventEnrollmentRepository;
import com.clubHouse.event_service2.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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

    public EnrollmentResponse enrollMe(Long eventId, String prn) throws ServiceException {

        log.info("Attempting to enroll {} in event with ID {}", prn, eventId);

        Optional<EventEnrollment> exists = enrollmentRepository.findByEvent_EventIdAndPrn(eventId, prn);

        if(exists.isPresent()){
            log.warn("You are already enrolled");
            return EnrollmentMapper.toResponse(exists.get(), prn);
        }

        Events event = eventRepository.findById(eventId).orElseThrow(
                () -> new NotFoundException("Events", eventId.toString())
        );

        EventEnrollment newEnrollment = EventEnrollment.builder()
                .prn(prn)
                .event(event)
                .build();

        EventEnrollment saved = enrollmentRepository.save(newEnrollment);

        return EnrollmentMapper.toResponse(saved, prn);
    }


    public List<EnrollmentResponse> getMyAllEnrollments(String prn) {

        log.info("Attempting to fetch all the enrollments of prn: {}", prn);

        List<EventEnrollment> resp = enrollmentRepository.findByPrn(prn);

        return EnrollmentMapper.toResponseList(resp, prn);

    }

    public Map<EventResponse, String> getMyEnrolledEvents(String prn) {

        log.info("Attempting to fetch events in which I have enrolled till date");

        List<EventEnrollment> enrollments = enrollmentRepository.findByPrn(prn);

        if (enrollments.isEmpty()) {
            log.info("No enrollments found");
            return Map.of();
        }

        // Extract events in same order as enrollments
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

    public List<CompleteEnrollmentResponse> getForEvent(Long eventId) {

        log.info("Attempting to fetch all enrolled users for event id: {}", eventId);

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
                        (a,b) -> a
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

    public void revokeMyEnrollment(Long enrollmentId) {
        log.info("Attempting to delete enrollment");
        enrollmentRepository.deleteById(enrollmentId);
    }

    public void revokeEnrollmentsOfEvent(Long eventId){
        log.info("Attempting to delete all the enrollments with event id: {}", eventId);
        enrollmentRepository.deleteByEvent_EventId(eventId);
    }


}
