package com.clubHouse.notification_service2.client;

import com.clubHouse.notification_service2.config.CacheConfig;
import com.clubHouse.notification_service2.dto.ApiResponse;
import com.clubHouse.notification_service2.dto.response.EventResponse;
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

    // ── Header helper ─────────────────────────────────────────────────────────

    private WebClient.RequestHeadersSpec<?> withForwardedHeaders(WebClient.RequestHeadersSpec<?> spec) {
        String auth   = request.getHeader("Authorization");
        String userId = request.getHeader("X-User-Id");
        String role   = request.getHeader("X-User-Role");
        if (auth   != null) spec = spec.header("Authorization", auth);
        if (userId != null) spec = spec.header("X-User-Id",     userId);
        if (role   != null) spec = spec.header("X-User-Role",   role);
        return spec;
    }

    // ── Not cached: user-specific and changes with enrollment status ──────────

    /**
     * Returns an empty map (not an exception) when the event service is
     * unhealthy or the user has no enrollments.
     * NotificationService already handles an empty map safely.
     */
    public Map<EventResponse, String> getMyEnrolledEvents() {
        try {
            log.info("Fetching my enrolled events from event-service");

            ApiResponse<Map<EventResponse, String>> response = withForwardedHeaders(
                    webClientBuilder.build()
                            .get()
                            .uri(eventServiceUrl + "/enrollments/myEnrollments"))
                    .retrieve()
                    .onStatus(
                            status -> status.isError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .doOnNext(body -> log.warn(
                                            "Event service returned {} for getMyEnrolledEvents: {}",
                                            clientResponse.statusCode(), body))
                                    .then(reactor.core.publisher.Mono.empty())
                    )
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<Map<EventResponse, String>>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .onErrorResume(e -> {
                        log.warn("getMyEnrolledEvents failed, falling back to empty map: {}", e.getMessage());
                        return reactor.core.publisher.Mono.empty();
                    })
                    .block();

            if (response != null && Boolean.TRUE.equals(response.getSuccess()) && response.getData() != null) {
                return response.getData();
            }

            log.warn("Empty/null response from getMyEnrolledEvents — returning empty map");
            return Map.of();

        } catch (Exception e) {
            log.error("getMyEnrolledEvents failed unexpectedly, returning empty map", e);
            return Map.of();
        }
    }

    // ── Cached: event titles don't change frequently ──────────────────────────

    @Cacheable(value = CacheConfig.EVENT_CACHE, key = "#id", unless = "#result == null")
    public EventResponse getEventById(Long id) {
        try {
            log.info("Fetching event id={} from event-service (cache miss)", id);

            ApiResponse<EventResponse> response = withForwardedHeaders(
                    webClientBuilder.build()
                            .get()
                            .uri(eventServiceUrl + "/events/getById/{eventId}", id))
                    .retrieve()
                    .onStatus(
                            status -> status.isError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .doOnNext(body -> log.warn(
                                            "Event service returned {} for eventId={}: {}",
                                            clientResponse.statusCode(), id, body))
                                    .then(reactor.core.publisher.Mono.empty())
                    )
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<EventResponse>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .onErrorResume(e -> {
                        log.warn("getEventById id={} failed, returning null: {}", id, e.getMessage());
                        return reactor.core.publisher.Mono.empty();
                    })
                    .block();

            if (response != null && Boolean.TRUE.equals(response.getSuccess()) && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response for eventId={}", id);
            return null;

        } catch (Exception e) {
            log.error("getEventById id={} failed unexpectedly, returning null", id, e);
            return null;
        }
    }

    @CacheEvict(value = CacheConfig.EVENT_CACHE, key = "#id")
    public void evictEventCache(Long id) {
        log.info("Evicted event cache for id={}", id);
    }
}