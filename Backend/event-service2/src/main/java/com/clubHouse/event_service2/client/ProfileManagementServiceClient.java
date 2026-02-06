package com.clubHouse.event_service2.client;

import com.clubHouse.event_service2.dto.ApiResponse;
import com.clubHouse.event_service2.dto.ProfileResponse;
import com.clubHouse.event_service2.exception.ExternalServiceException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${app.profile-service.url}")
    private String profileServiceUrl;
    private final HttpServletRequest request;

    public List<String> getExpiredProfiles() {
        String authHeader = request.getHeader("Authorization");
        try {
            log.info("Attempting to fetch expired profiles");

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

            log.warn("Invalid or empty response");
            return null;

        } catch (Exception e) {
            log.error("Failed to get expired profiles", e);
            throw new ExternalServiceException("Unable to get expired profiles. " +
                    "Please try again later", e);
        }
    }

    public ProfileResponse getProfileByPrn(String prn) {
        String authHeader = request.getHeader("Authorization");
        try {
            log.info("Attempting to fetch profile for PRN: {}, from event-service",
                    prn);

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

            log.warn("Invalid or empty response");
            return null;

        } catch (Exception e) {
            log.error("Failed to get profile for PRN: {}", prn, e);
            throw new ExternalServiceException("Unable to get profile. Please try again later", e);
        }
    }

    public List<ProfileResponse> getProfilesByPrns(List<String> prns) {

        String authHeader = request.getHeader("Authorization");

        try {
            log.info("Attempting to fetch profiles from profile-service for PRNs: {}", prns);

            ApiResponse<List<ProfileResponse>> response = webClientBuilder.build()
                    .post()
                    .uri(profileServiceUrl + "/profiles/prns")
                    .header("Authorization", authHeader)
                    .bodyValue(prns)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<
                            ApiResponse<List<ProfileResponse>>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .block();

            if (response != null && Boolean.TRUE.equals(response.getSuccess())
                    && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response from profile-service");
            return List.of();

        } catch (Exception e) {
            log.error("Failed to get profiles from profile-service", e);
            throw new ExternalServiceException(
                    "Unable to fetch profiles. Please try again later", e);
        }
    }

    public void markProfilesAsCleanedUp(List<String> prns) {
        String authHeader = request.getHeader("Authorization");
        try {
            log.info("Notifying profile service: cleanup complete for {} profiles", prns.size());

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
            // Don't throw - this is a notification, not critical
        }
    }

}