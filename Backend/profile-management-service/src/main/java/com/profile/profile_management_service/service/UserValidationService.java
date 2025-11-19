package com.profile.profile_management_service.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;


@Service
@Slf4j
@RequiredArgsConstructor
public class UserValidationService {
    private final WebClient userServiceWebClient;

    @Autowired
    private HttpServletRequest request; // inject the request

    public boolean validateUser(String prn) {
        // Extract the original Authorization header
        String authorizationHeader = request.getHeader("Authorization");

        log.info("Calling User Validation API for userId: {}", prn);

        try {
            return Boolean.TRUE.equals(userServiceWebClient.get()
                    .uri("api/users/validate/{prn}", prn)
                    .header("Authorization", authorizationHeader) // forward the token as-is
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block());
        } catch (WebClientResponseException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new RuntimeException("User not Found: " + prn);
            } else if (e.getStatusCode() == HttpStatus.BAD_REQUEST) {
                throw new RuntimeException("Invalid Request: " + prn);
            } else {
                throw new RuntimeException("User validation failed with status: " + e.getStatusCode(), e);
            }
        }
    }
}
