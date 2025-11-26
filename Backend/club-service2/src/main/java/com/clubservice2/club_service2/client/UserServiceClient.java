package com.clubservice2.club_service2.client;

import com.clubservice2.club_service2.exception.ExternalServiceException;
import com.clubservice2.club_service2.exception.UserNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceClient {

    private final WebClient userServiceWebClient;
    private final HttpServletRequest request;

    /**
     * Validates if a user exists with the given PRN
     */
    public boolean validateUser(String prn) {
        String authHeader = request.getHeader("Authorization");

        log.debug("Validating user with PRN: {}", prn);

        try {
            Boolean isValid = userServiceWebClient.get()
                    .uri("/api/users/validate/{prn}", prn)
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();

            boolean result = Boolean.TRUE.equals(isValid);
            log.debug("User validation result for PRN {}: {}", prn, result);
            return result;

        } catch (WebClientResponseException.NotFound e) {
            log.warn("User not found with PRN: {}", prn);
            throw new UserNotFoundException(prn);
        } catch (WebClientResponseException e) {
            log.error("User service returned error for PRN {}: {} - {}",
                    prn, e.getStatusCode(), e.getMessage());
            throw new ExternalServiceException("User Service",
                    String.format("Validation failed with status: %s", e.getStatusCode()), e);
        } catch (Exception e) {
            log.error("Unexpected error validating user with PRN: {}", prn, e);
            throw new ExternalServiceException("User Service",
                    "Unexpected error during user validation", e);
        }
    }
}