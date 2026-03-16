package com.clubHouse.event_service2.service;

import com.clubHouse.event_service2.config.CacheConfig;
import com.clubHouse.event_service2.dto.request.RatingRequest;
import com.clubHouse.event_service2.dto.response.RatingResponse;
import com.clubHouse.event_service2.exception.NotFoundException;
import com.clubHouse.event_service2.exception.ServiceException;
import com.clubHouse.event_service2.mapper.RatingsMapper;
import com.clubHouse.event_service2.model.Attendance;
import com.clubHouse.event_service2.model.Events;
import com.clubHouse.event_service2.model.Ratings;
import com.clubHouse.event_service2.repository.AttendanceRepository;
import com.clubHouse.event_service2.repository.EventRepository;
import com.clubHouse.event_service2.repository.RatingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class RatingsService {

    private final RatingsRepository ratingsRepository;
    private final EventRepository eventRepository;
    private final AttendanceRepository attendanceRepository;

    @Transactional
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
            @CacheEvict(value = CacheConfig.EVENTS_BY_ENROLLMENT_STATUS, allEntries = true)
    })
    public RatingResponse rateEvent(String prn, RatingRequest req) {

        log.info("Attempting to rate event with ID: {}", req.getEventId());

        if (req.getRating() < 1 || req.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        Events event = eventRepository.findById(req.getEventId()).orElseThrow(
                () -> new NotFoundException("Event", req.getEventId().toString())
        );

        Optional<Attendance> attendance = attendanceRepository.findByEventAndPrn(event, prn);

        if(attendance.isEmpty()){
            throw new ServiceException(
                    "You cant give ratings to the event since you didn't attended it."
            );
        }else{
            Attendance getAttendance = attendance.get();
            getAttendance.setRated(true);
            getAttendance.setRatings(req.getRating());
        }

        Ratings eventRating = ratingsRepository.findByEvent(event);

        eventRating.setRatingSum(eventRating.getRatingSum() + req.getRating());
        eventRating.setCount(eventRating.getCount() + 1);
        Ratings saved = ratingsRepository.save(eventRating);

        return RatingsMapper.toResponse(saved);

    }

    public RatingResponse getRating(Long eventId) {

        log.info("Attempting to fetch rating for eventId: {}", eventId);

        Ratings eventRating = ratingsRepository.findByEvent_EventId(eventId);

        return RatingsMapper.toResponse(eventRating);

    }

    public List<RatingResponse> getRatingForIds(List<Long> eventIds) {

        log.info("Attempting to fetch ratings for eventIds: {}", eventIds);

        List<Ratings> ratings = ratingsRepository.findByEvent_EventIdIn(eventIds);

        return RatingsMapper.toResponseList(ratings);

    }
}
