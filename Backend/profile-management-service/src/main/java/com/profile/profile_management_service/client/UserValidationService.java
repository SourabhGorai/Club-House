package com.profile.profile_management_service.client;

import com.profile.profile_management_service.exception.ExternalServiceException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;


@Service
@Slf4j
@RequiredArgsConstructor
public class UserValidationService {

    private final WebClient.Builder webClientBuilder;
    private final HttpServletRequest request;

    @Value("${app.user-service.url}")
    private String userServiceUrl;

    public boolean validateUser(String prn) {
        String authHeader = request.getHeader("Authorization");

        try {
            log.info("Validating user for PRN: {}", prn);

            Boolean response = webClientBuilder.build()
                    .get()
                    .uri(userServiceUrl + "/users/validate/{prn}", prn)
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();

            if (response != null) {
                return response;
            }

            log.warn("Empty response received while validating PRN: {}", prn);
            return false;

        } catch (WebClientResponseException e) {
            log.error("User validation failed with status {} for PRN: {}",
                    e.getStatusCode(), prn, e);

            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new RuntimeException("User not found: " + prn);
            }

            throw new RuntimeException("User validation failed", e);

        } catch (Exception e) {
            log.error("Error while validating PRN: {}", prn, e);
            throw new ExternalServiceException(
                    "Unable to validate user. Please try again later", e
            );
        }
    }
}
