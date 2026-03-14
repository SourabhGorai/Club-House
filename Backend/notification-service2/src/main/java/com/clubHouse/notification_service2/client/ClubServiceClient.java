package com.clubHouse.notification_service2.client;

import com.clubHouse.notification_service2.config.CacheConfig;
import com.clubHouse.notification_service2.dto.ApiResponse;
import com.clubHouse.notification_service2.dto.response.ClubResponse;
import com.clubHouse.notification_service2.dto.response.GeneralClubResponse;
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

    public List<GeneralClubResponse> getMyClubs() {
        try {
            log.info("Fetching my clubs from CLUB-SERVICE");

            ApiResponse<List<GeneralClubResponse>> response = withForwardedHeaders(
                    webClientBuilder.build()
                            .get()
                            .uri(clubServiceUrl + "/user-clubs/getMyClubs"))
                    .retrieve()
                    .onStatus(
                            status -> status.isError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .doOnNext(body -> log.warn(
                                            "Club service returned {} for getMyClubs: {}",
                                            clientResponse.statusCode(), body))
                                    .then(reactor.core.publisher.Mono.empty())
                    )
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<List<GeneralClubResponse>>>() {})
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

    // ── Cached: club metadata rarely changes ─────────────────────────────────

    @Cacheable(value = CacheConfig.CLUB_CACHE, key = "#id", unless = "#result == null")
    public ClubResponse getClubById(Long id) {
        try {
            log.info("Fetching club id={} from CLUB-SERVICE (cache miss)", id);

            ApiResponse<ClubResponse> response = withForwardedHeaders(
                    webClientBuilder.build()
                            .get()
                            .uri(clubServiceUrl + "/clubs/getById/{id}", id))
                    .retrieve()
                    .onStatus(
                            status -> status.isError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .doOnNext(body -> log.warn(
                                            "Club service returned {} for clubId={}: {}",
                                            clientResponse.statusCode(), id, body))
                                    .then(reactor.core.publisher.Mono.empty())
                    )
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<ClubResponse>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .onErrorResume(e -> {
                        log.warn("getClubById id={} failed, returning null: {}", id, e.getMessage());
                        return reactor.core.publisher.Mono.empty();
                    })
                    .block();

            if (response != null && Boolean.TRUE.equals(response.getSuccess()) && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response for clubId={}", id);
            return null;

        } catch (Exception e) {
            log.error("getClubById id={} failed unexpectedly, returning null", id, e);
            return null;
        }
    }

    @CacheEvict(value = CacheConfig.CLUB_CACHE, key = "#id")
    public void evictClubCache(Long id) {
        log.info("Evicted club cache for id={}", id);
    }

    // ── Not cached: write/delete operations ──────────────────────────────────

    public void permanentlyDeleteUserFromClubService(String prn) {
        String authHeader = request.getHeader("Authorization");
        log.info("Permanently deleting user {} from all clubs", prn);
        try {
            webClientBuilder.build()
                    .delete()
                    .uri(clubServiceUrl + "/user-clubs/permanentlyDelete/{prn}", prn)
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
            log.info("Successfully permanently deleted user {} from club service", prn);
        } catch (WebClientResponseException.NotFound e) {
            log.info("User {} not associated with any clubs — skipping", prn);
        } catch (WebClientResponseException e) {
            log.error("Error permanently deleting user {}: {} - {}", prn, e.getStatusCode(), e.getMessage());
            throw new RuntimeException("Failed to delete user from clubs for PRN: " + prn, e);
        } catch (Exception e) {
            log.error("Unexpected error permanently deleting user {}: {}", prn, e.getMessage());
            throw new RuntimeException("Failed to delete user from clubs for PRN: " + prn, e);
        }
    }

    public void removeUserFromClub(String prn, String clubName) {
        String authHeader = request.getHeader("Authorization");
        log.info("Removing user {} from club {}", prn, clubName);
        try {
            webClientBuilder.build()
                    .delete()
                    .uri(clubServiceUrl + "/user-clubs/user/{prn}/club/{clubName}", prn, clubName)
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
            log.info("Successfully removed user {} from club {}", prn, clubName);
        } catch (WebClientResponseException e) {
            log.error("Error removing user {} from club {}: {} - {}", prn, clubName, e.getStatusCode(), e.getMessage());
            throw new RuntimeException("Failed to remove user from club: " + clubName, e);
        } catch (Exception e) {
            log.error("Unexpected error removing user {} from club {}: {}", prn, clubName, e.getMessage());
            throw new RuntimeException("Failed to remove user from club: " + clubName, e);
        }
    }

    public List<String> getUserClubNames(String prn) {
        String authHeader = request.getHeader("Authorization");
        log.debug("Fetching club names for user: {}", prn);
        try {
            List<String> clubNames = webClientBuilder.build()
                    .get()
                    .uri(clubServiceUrl + "/user-clubs/user/{prn}/club-names", prn)
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(ApiResponseWrapper.class)
                    .map(resp -> (List<String>) resp.getData())
                    .onErrorResume(e -> {
                        log.warn("getUserClubNames for prn={} failed: {}", prn, e.getMessage());
                        return reactor.core.publisher.Mono.empty();
                    })
                    .block();
            return clubNames != null ? clubNames : List.of();
        } catch (Exception e) {
            log.error("Error fetching club names for user {}: {}", prn, e.getMessage());
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