package com.clubHouse.notification_service2.client;

import com.clubHouse.notification_service2.config.CacheConfig;
import com.clubHouse.notification_service2.dto.ApiResponse;
import com.clubHouse.notification_service2.dto.response.EventResponse;
import com.clubHouse.notification_service2.exception.ExternalServiceException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final HttpServletRequest request;

    @Value("${app.event-service.url}")
    private String eventServiceUrl;

    // ── Not cached: user-specific and changes with enrollment status ──────────

    public Map<EventResponse, String> getMyEnrolledEvents() {
        String authHeader = request.getHeader("Authorization");
        try {
            log.info("Fetching my enrolled events from event-service");

            ApiResponse<Map<EventResponse, String>> response = webClientBuilder.build()
                    .get()
                    .uri(eventServiceUrl + "/enrollments/myEnrollments")
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<Map<EventResponse, String>>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .block();

            if (response != null && response.getSuccess() && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response from getMyEnrolledEvents");
            return Map.of();

        } catch (Exception e) {
            log.error("Failed to get enrolled events", e);
            throw new ExternalServiceException("Unable to get events. Please try again later", e);
        }
    }

    // ── Cached: event titles don't change frequently ──────────────────────────

    /**
     * Cached by eventId. TTL is 10 min (shorter than clubs/depts because
     * event titles/details are more likely to be updated before the event).
     * Call {@link #evictEventCache(Long)} if the event is updated.
     */
    @Cacheable(value = CacheConfig.EVENT_CACHE, key = "#id", unless = "#result == null")
    public EventResponse getEventById(Long id) {
        String authHeader = request.getHeader("Authorization");
        try {
            log.info("Fetching event id={} from event-service (cache miss)", id);

            ApiResponse<EventResponse> response = webClientBuilder.build()
                    .get()
                    .uri(eventServiceUrl + "/events/getById/{eventId}", id)
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<EventResponse>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .block();

            if (response != null && response.getSuccess() && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response for eventId={}", id);
            return null;

        } catch (Exception e) {
            log.error("Failed to get event id={}", id, e);
            throw new ExternalServiceException("Unable to get event. Please try again later", e);
        }
    }

    @CacheEvict(value = CacheConfig.EVENT_CACHE, key = "#id")
    public void evictEventCache(Long id) {
        log.info("Evicted event cache for id={}", id);
    }
}