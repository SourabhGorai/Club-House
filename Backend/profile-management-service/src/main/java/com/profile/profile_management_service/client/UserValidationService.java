package com.profile.profile_management_service.client;

import com.profile.profile_management_service.exception.ExternalServiceException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserValidationService {

    private final WebClient.Builder webClientBuilder;

    @Value("${app.user-service.url}")
    private String userServiceUrl;

    private final HttpServletRequest request;

    public Boolean validateUser(String prn) {
        String authHeader = request.getHeader("Authorization");

        try {
            log.info("Attempting to validate user with PRN: {} from user-service", prn);

            Boolean response = webClientBuilder.build()
                    .get()
                    .uri(userServiceUrl + "/users/validate/{prn}", prn)
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();

            if (response != null) {
                log.info("User validation result for PRN {}: {}", prn, response);
                return response;
            }

            log.warn("Invalid or empty response from user-service for PRN: {}", prn);
            return false;

        } catch (Exception e) {
            log.error("Failed to validate user with PRN: {}", prn, e);
            throw new ExternalServiceException(
                    "Unable to validate user. Please try again later", e);
        }
    }
}