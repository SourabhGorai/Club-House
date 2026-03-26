package com.clubHouse.event_service2.client;

import com.clubHouse.event_service2.dto.response.ApiResponse;
import com.clubHouse.event_service2.dto.response.ClubResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ClubServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final HttpServletRequest request;

    @Value("${app.club-service.url:http://CLUB-SERVICE2/api}")
    private String clubServiceUrl;

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

    // ── Not cached: user-specific, changes with membership ───────────────────

    public List<ClubResponse> getAllClubs() {
        try {
            log.info("Fetching all clubs from CLUB-SERVICE");

            ApiResponse<List<ClubResponse>> response = withForwardedHeaders(
                    webClientBuilder.build()
                            .get()
                            .uri(clubServiceUrl + "/clubs"))
                    .retrieve()
                    .onStatus(
                            status -> status.isError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .doOnNext(body -> log.warn(
                                            "Club service returned {} for getMyClubs: {}",
                                            clientResponse.statusCode(), body))
                                    .then(reactor.core.publisher.Mono.empty())
                    )
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<List<ClubResponse>>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .onErrorResume(e -> {
                        log.warn("getMyClubs call failed, falling back to empty list: {}", e.getMessage());
                        return reactor.core.publisher.Mono.empty();
                    })
                    .block();

            if (response != null && response.getData() != null) {
                return response.getData();
            }

            log.warn("Empty/null response from getMyClubs — returning empty list");
            return List.of();

        } catch (Exception e) {
            log.error("getMyClubs failed unexpectedly, returning empty list", e);
            return List.of();
        }
    }

    @lombok.Data
    private static class ApiResponseWrapper {
        private boolean success;
        private String message;
        private Object data;
    }
}