package com.clubHouse.notification_service2.client;

import com.clubHouse.notification_service2.config.CacheConfig;
import com.clubHouse.notification_service2.dto.ApiResponse;
import com.clubHouse.notification_service2.dto.response.ProfileResponse;
import com.clubHouse.notification_service2.dto.response.RawResponseForNotification;
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
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProfileManagementServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final HttpServletRequest request;

    @Value("${app.profile-service.url}")
    private String profileServiceUrl;

    // ── Cached: dept ID + year for a user almost never changes ───────────────

    /**
     * Cached by PRN. This is called on every /me request, so caching it
     * eliminates a redundant HTTP call to the profile service on repeat hits.
     *
     * Evict via {@link #evictProfileDataCache(String)} if a user's
     * department or year is updated in the profile service.
     */
    @Cacheable(value = CacheConfig.PROFILE_DATA_CACHE, key = "#prn", unless = "#result == null")
    public RawResponseForNotification getDepartmentIdFromPrn(String prn) {
        String authHeader = request.getHeader("Authorization");
        try {
            log.info("Fetching dept+year for prn={} from profile-service (cache miss)", prn);

            ApiResponse<RawResponseForNotification> response = webClientBuilder.build()
                    .get()
                    .uri(profileServiceUrl + "/profiles/getDataForNotification/{prn}", prn)
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<RawResponseForNotification>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .block();

            if (response != null && response.getSuccess() && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response for prn={}", prn);
            return null;

        } catch (Exception e) {
            log.error("Failed to get dept+year for prn={}", prn, e);
            throw new ExternalServiceException("Unable to get profile data. Please try again later", e);
        }
    }

    /**
     * Call this if a user's department or year changes in the profile service,
     * so their next /me request fetches fresh data.
     */
    @CacheEvict(value = CacheConfig.PROFILE_DATA_CACHE, key = "#prn")
    public void evictProfileDataCache(String prn) {
        log.info("Evicted profileData cache for prn={}", prn);
    }

    // ── Not cached: these are either writes or bulk/admin operations ──────────

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
                    .block();

            if (response != null && response.getSuccess() && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response from getExpiredProfiles");
            return List.of();

        } catch (Exception e) {
            log.error("Failed to get expired profiles", e);
            throw new ExternalServiceException("Unable to get expired profiles. Please try again later", e);
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
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<ProfileResponse>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .block();

            if (response != null && response.getSuccess() && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response for prn={}", prn);
            return null;

        } catch (Exception e) {
            log.error("Failed to get profile for prn={}", prn, e);
            throw new ExternalServiceException("Unable to get profile. Please try again later", e);
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
                    .block();

            if (response != null && Boolean.TRUE.equals(response.getSuccess()) && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response from getProfilesByPrns");
            return List.of();

        } catch (Exception e) {
            log.error("Failed to get profiles by PRNs", e);
            throw new ExternalServiceException("Unable to fetch profiles. Please try again later", e);
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
                    .block();

            if (response != null && response.getSuccess()) {
                log.info("Successfully marked {} profiles as cleaned up", prns.size());
            } else {
                log.warn("Failed to mark profiles as cleaned up");
            }

        } catch (Exception e) {
            log.error("Error marking profiles as cleaned up", e);
            // Don't throw — this is a notification, not critical
        }
    }
}