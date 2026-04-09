package com.clubservice2.club_service2.client;

import com.clubservice2.club_service2.dto.ApiResponse;
import com.clubservice2.club_service2.exception.ExternalServiceException;
import com.clubservice2.club_service2.exception.UserNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceClient {

    private final WebClient userServiceWebClient;
    private final HttpServletRequest request;

    public void validateUser(String prn) {
        String authHeader = request.getHeader("Authorization");

        log.debug("Validating user with PRN: {}", prn);

        try {
            ApiResponse<Boolean> response = userServiceWebClient.get()
                    .uri("/api/users/validate/{prn}", prn)
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<Boolean>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .block();

            if (response != null && Boolean.TRUE.equals(response.getSuccess())) {
                boolean result = Boolean.TRUE.equals(response.getData());
                log.debug("User validation result for PRN {}: {}", prn, result);
                return;
            }

            log.warn("Invalid response from user-service for PRN: {}", prn);

        } catch (WebClientResponseException.NotFound e) {
            log.warn("User not found with PRN: {}", prn);
            throw new UserNotFoundException(prn);

        } catch (WebClientResponseException e) {
            log.error("User service error for PRN {}: {} - {}",
                    prn, e.getStatusCode(), e.getMessage());

            throw new ExternalServiceException(
                    "User Service",
                    String.format("Validation failed with status: %s", e.getStatusCode()),
                    e
            );

        } catch (Exception e) {
            log.error("Unexpected error validating user with PRN: {}", prn, e);

            throw new ExternalServiceException(
                    "User Service",
                    "Unexpected error during user validation",
                    e
            );
        }
    }
}