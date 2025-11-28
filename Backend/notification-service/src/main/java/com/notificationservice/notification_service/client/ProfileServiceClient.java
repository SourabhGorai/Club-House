package com.notificationservice.notification_service.client;

import com.notificationservice.notification_service.dto.ApiResponseWrapper;
import com.notificationservice.notification_service.dto.ProfileSummaryResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileServiceClient {

    private final WebClient profileServiceWebClient;
    private final WebClient clubServiceWebClient;
    private final HttpServletRequest request;

    /**
     * Fetches profile summary by PRN
     */
    public ProfileSummaryResponse getProfileSummary(String prn) {
        String authHeader = request.getHeader("Authorization");

        log.debug("Fetching profile summary for PRN: {}", prn);

        try {
            ApiResponseWrapper<ProfileSummaryResponse> response = profileServiceWebClient.get()
                    .uri("/api/profiles/summary/{prn}", prn)
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponseWrapper<ProfileSummaryResponse>>() {})
                    .block();

            if (response == null || response.getData() == null) {
                log.warn("Profile service returned null for PRN: {}", prn);
                return createFallbackProfile(prn);
            }

            return response.getData();

        } catch (WebClientResponseException e) {
            log.warn("Failed to fetch profile for PRN {}: {}", prn, e.getStatusCode());
            return createFallbackProfile(prn);
        } catch (Exception e) {
            log.error("Unexpected error fetching profile for PRN: {}", prn, e);
            return createFallbackProfile(prn);
        }
    }

    /**
     * Gets list of clubs a user belongs to
     */
    public List<String> getUserClubs(String prn) {
        String authHeader = request.getHeader("Authorization");

        log.debug("Fetching clubs for user: {}", prn);

        try {
            // Call club-service to get user's club names (lightweight endpoint)
            ApiResponseWrapper<List<String>> response = clubServiceWebClient.get()
                    .uri("/api/user-clubs/user/{prn}/club-names", prn)  // ← Changed endpoint
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponseWrapper<List<String>>>() {})
                    .block();

            if (response == null || response.getData() == null) {
                log.debug("No clubs found for user: {}", prn);
                return Collections.emptyList();
            }

            return response.getData();

        } catch (WebClientResponseException.NotFound e) {
            log.debug("No clubs found for user: {}", prn);
            return Collections.emptyList();
        } catch (Exception e) {
            log.error("Error fetching clubs for user: {}", prn, e);
            return Collections.emptyList();
        }
    }

    private ProfileSummaryResponse createFallbackProfile(String prn) {
        return ProfileSummaryResponse.builder()
                .prn(prn)
                .fullName("N/A")
                .department("N/A")
                .year(null)
                .build();
    }
}