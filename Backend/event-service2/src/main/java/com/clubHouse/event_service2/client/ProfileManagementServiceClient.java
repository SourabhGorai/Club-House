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

    @Value("${app.sla-service.url}")
    private String slaServiceUrl;
    private final HttpServletRequest request;

    public ProfileResponse getProfileByPrn(String prn) {
        String authHeader = request.getHeader("Authorization");
        try {
            log.info("Attempting to fetch profile for PRN: {}, from event-service",
                    prn);

            ApiResponse<ProfileResponse> response = webClientBuilder.build()
                    .get()
                    .uri(slaServiceUrl + "/profiles/prn/{prn}", prn)
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
            throw new ExternalServiceException("Unable to validate role. Please try again later", e);
        }
    }

    public List<ProfileResponse> getProfilesByPrns(List<String> prns) {

        String authHeader = request.getHeader("Authorization");

        try {
            log.info("Attempting to fetch profiles from profile-service for PRNs: {}", prns);

            ApiResponse<List<ProfileResponse>> response = webClientBuilder.build()
                    .post()
                    .uri(slaServiceUrl + "/profiles/prns")
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


}