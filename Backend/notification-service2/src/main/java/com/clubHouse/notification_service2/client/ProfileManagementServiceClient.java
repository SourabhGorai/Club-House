package com.clubHouse.notification_service2.client;

import com.clubHouse.notification_service2.config.CacheConfig;
import com.clubHouse.notification_service2.dto.ApiResponse;
import com.clubHouse.notification_service2.dto.response.ProfileResponse;
import com.clubHouse.notification_service2.dto.response.RawResponseForNotification;
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
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProfileManagementServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final HttpServletRequest request;

    @Value("${app.profile-service.url}")
    private String profileServiceUrl;

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

    // ── Cached: dept ID + year almost never changes ───────────────────────────

    /**
     * Returns null (not an exception) when the profile doesn't exist or the
     * profile service is unhealthy. NotificationService already handles null safely.
     *
     * NOTE: unless = "#result == null" means a null result is NOT cached, so the
     * next request will retry the profile service. Once a real result comes back
     * it will be cached normally.
     */
    @Cacheable(value = CacheConfig.PROFILE_DATA_CACHE, key = "#prn", unless = "#result == null")
    public RawResponseForNotification getDepartmentIdFromPrn(String prn) {
        try {
            log.info("Fetching dept+year for prn={} from profile-service (cache miss)", prn);

            ApiResponse<RawResponseForNotification> response = withForwardedHeaders(
                    webClientBuilder.build()
                            .get()
                            .uri(profileServiceUrl + "/profiles/getDataForNotification/{prn}", prn))
                    .retrieve()
                    .onStatus(
                            status -> status.isError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .doOnNext(body -> log.warn(
                                            "Profile service returned {} for prn={}: {}",
                                            clientResponse.statusCode(), prn, body))
                                    .then(reactor.core.publisher.Mono.empty())
                    )
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<RawResponseForNotification>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .onErrorResume(e -> {
                        log.warn("getDepartmentIdFromPrn for prn={} failed, returning null: {}", prn, e.getMessage());
                        return reactor.core.publisher.Mono.empty();
                    })
                    .block();

            if (response != null && Boolean.TRUE.equals(response.getSuccess()) && response.getData() != null) {
                return response.getData();
            }

            log.warn("Empty/null response from profile-service for prn={} — returning null", prn);
            return null;

        } catch (Exception e) {
            log.error("getDepartmentIdFromPrn for prn={} failed unexpectedly, returning null", prn, e);
            return null;
        }
    }

    @CacheEvict(value = CacheConfig.PROFILE_DATA_CACHE, key = "#prn")
    public void evictProfileDataCache(String prn) {
        log.info("Evicted profileData cache for prn={}", prn);
    }

    // ── Not cached: writes or bulk/admin operations ───────────────────────────

    public List<String> getExpiredProfiles() {
        String authHeader = request.getHeader("Authorization");
        try {
            log.info("Fetching expired profiles from profile-service");

            ApiResponse<List<String>> response = webClientBuilder.build()
                    .get()
                    .uri(profileServiceUrl + "/profiles/expiredProfiles")
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<List<String>>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .onErrorResume(e -> {
                        log.warn("getExpiredProfiles failed: {}", e.getMessage());
                        return reactor.core.publisher.Mono.empty();
                    })
                    .block();

            if (response != null && Boolean.TRUE.equals(response.getSuccess()) && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response from getExpiredProfiles");
            return List.of();

        } catch (Exception e) {
            log.error("Failed to get expired profiles", e);
            return List.of();
        }
    }

    public ProfileResponse getProfileByPrn(String prn) {
        String authHeader = request.getHeader("Authorization");
        try {
            log.info("Fetching full profile for prn={} from profile-service", prn);

            ApiResponse<ProfileResponse> response = webClientBuilder.build()
                    .get()
                    .uri(profileServiceUrl + "/profiles/prn/{prn}", prn)
                    .header("Authorization", authHeader)
                    .retrieve()
                    .onStatus(
                            status -> status.isError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .doOnNext(body -> log.warn(
                                            "Profile service returned {} for getProfileByPrn prn={}: {}",
                                            clientResponse.statusCode(), prn, body))
                                    .then(reactor.core.publisher.Mono.empty())
                    )
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<ProfileResponse>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .onErrorResume(e -> {
                        log.warn("getProfileByPrn prn={} failed: {}", prn, e.getMessage());
                        return reactor.core.publisher.Mono.empty();
                    })
                    .block();

            if (response != null && Boolean.TRUE.equals(response.getSuccess()) && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response for prn={}", prn);
            return null;

        } catch (Exception e) {
            log.error("Failed to get profile for prn={}, returning null", prn, e);
            return null;
        }
    }

    public List<ProfileResponse> getProfilesByPrns(List<String> prns) {
        String authHeader = request.getHeader("Authorization");
        try {
            log.info("Fetching profiles for {} PRNs from profile-service", prns.size());

            ApiResponse<List<ProfileResponse>> response = webClientBuilder.build()
                    .post()
                    .uri(profileServiceUrl + "/profiles/prns")
                    .header("Authorization", authHeader)
                    .bodyValue(prns)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<List<ProfileResponse>>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .onErrorResume(e -> {
                        log.warn("getProfilesByPrns failed: {}", e.getMessage());
                        return reactor.core.publisher.Mono.empty();
                    })
                    .block();

            if (response != null && Boolean.TRUE.equals(response.getSuccess()) && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response from getProfilesByPrns");
            return List.of();

        } catch (Exception e) {
            log.error("Failed to get profiles by PRNs", e);
            return List.of();
        }
    }

    public void markProfilesAsCleanedUp(List<String> prns) {
        String authHeader = request.getHeader("Authorization");
        try {
            log.info("Marking {} profiles as cleaned up", prns.size());

            ApiResponse<Integer> response = webClientBuilder.build()
                    .put()
                    .uri(profileServiceUrl + "/profiles/markAsCleanedUp")
                    .header("Authorization", authHeader)
                    .bodyValue(prns)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<Integer>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .onErrorResume(e -> {
                        log.warn("markProfilesAsCleanedUp failed: {}", e.getMessage());
                        return reactor.core.publisher.Mono.empty();
                    })
                    .block();

            if (response != null && Boolean.TRUE.equals(response.getSuccess())) {
                log.info("Successfully marked {} profiles as cleaned up", prns.size());
            } else {
                log.warn("Failed to mark profiles as cleaned up");
            }

        } catch (Exception e) {
            log.error("Error marking profiles as cleaned up", e);
            // Non-critical — don't rethrow
        }
    }
}