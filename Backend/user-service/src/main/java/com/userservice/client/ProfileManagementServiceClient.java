package com.userservice.client;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProfileManagementServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final HttpServletRequest request;

    @Value("${services.profile-service.url:http://PROFILE-MANAGEMENT-SERVICE/api}")
    private String profileServiceUrl;

    public void permanentlyDeleteProfile(String prn) {
        String authHeader = request.getHeader("Authorization");
        log.info("Calling profile service to permanently delete profile for PRN: {}", prn);

        try {
            webClientBuilder.build()
                    .delete()
                    .uri(profileServiceUrl + "/profiles/permanentDelete/{prn}", prn)
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();

            log.info("Successfully deleted profile for PRN: {}", prn);

        } catch (WebClientResponseException.NotFound e) {
            log.warn("Profile not found for PRN {} - may have been already deleted or never created", prn);

        } catch (WebClientResponseException e) {
            log.error("Error deleting profile for PRN {}: {} - {}",
                    prn, e.getStatusCode(), e.getMessage());
            throw new RuntimeException("Failed to delete profile for PRN: " + prn, e);

        } catch (Exception e) {
            log.error("Unexpected error deleting profile for PRN {}: {}", prn, e.getMessage());
            throw new RuntimeException("Failed to delete profile for PRN: " + prn, e);
        }
    }
}