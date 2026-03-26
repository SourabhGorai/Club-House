package com.clubHouse.event_service2.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {

    // Event caches
    public static final String EVENT_BY_ID = "eventById";
    public static final String ALL_EVENTS = "allEvents";
    public static final String MY_EVENTS = "myEvents";
    public static final String EVENTS_BY_TARGET_TYPE = "eventsByTargetType";
    public static final String EVENTS_BY_CREATOR = "eventsByCreator";
    public static final String EVENTS_BY_ORGANIZER = "eventsByOrganizer";
    public static final String EVENTS_BY_RATING = "eventsByRating";
    public static final String EVENTS_BY_TARGET_DATA = "eventsByTargetData";
    public static final String EVENTS_BY_STATUS = "eventsByStatus";
    public static final String EVENTS_BY_ENROLLMENT_STATUS = "eventsByEnrollmentStatus";
    public static final String TARGET_TYPES = "targetTypes";

    // Enrollment caches
    public static final String MY_ENROLLMENTS = "myEnrollments";
    public static final String MY_ENROLLED_EVENTS = "myEnrolledEvents";
    public static final String ENROLLMENTS_FOR_EVENT = "enrollmentsForEvent";

    public static final String EVENT_COUNT_BY_CLUB = "eventCountByClub";

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager(
                EVENT_BY_ID,
                ALL_EVENTS,
                MY_EVENTS,
                EVENTS_BY_TARGET_TYPE,
                EVENTS_BY_CREATOR,
                EVENTS_BY_ORGANIZER,
                EVENTS_BY_RATING,
                EVENTS_BY_TARGET_DATA,
                EVENTS_BY_STATUS,
                EVENTS_BY_ENROLLMENT_STATUS,
                TARGET_TYPES,
                MY_ENROLLMENTS,
                MY_ENROLLED_EVENTS,
                ENROLLMENTS_FOR_EVENT,
                EVENT_COUNT_BY_CLUB
        );
    }
}