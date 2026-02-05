package com.userservice.client;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ClubServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final HttpServletRequest request;

    @Value("${services.club-service.url:http://CLUB-SERVICE2/api}")
    private String clubServiceUrl;

    /**
     * Permanently delete user from club service (remove from all clubs in one call)
     */
    public void permanentlyDeleteUserFromClubService(String prn) {
        String authHeader = request.getHeader("Authorization");
        log.info("Calling club service to permanently delete user {} from all clubs", prn);

        try {
            webClientBuilder.build()
                    .delete()
                    .uri(clubServiceUrl + "/user-clubs/permanentlyDelete/{prn}", prn)
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();

            log.info("Successfully permanently deleted user {} from club service", prn);

        } catch (WebClientResponseException.NotFound e) {
            // User not in any club - this is fine, not an error
            log.info("User {} is not associated with any clubs - skipping club deletion", prn);

        } catch (WebClientResponseException e) {
            log.error("Error permanently deleting user {} from club service: {} - {}",
                    prn, e.getStatusCode(), e.getMessage());
            // Re-throw to trigger transaction rollback
            throw new RuntimeException("Failed to delete user from clubs for PRN: " + prn, e);

        } catch (Exception e) {
            log.error("Unexpected error permanently deleting user {} from club service: {}",
                    prn, e.getMessage());
            // Re-throw to trigger transaction rollback
            throw new RuntimeException("Failed to delete user from clubs for PRN: " + prn, e);
        }
    }

    /**
     * Remove a user from a specific club
     */
    public void removeUserFromClub(String prn, String clubName) {
        String authHeader = request.getHeader("Authorization");
        log.info("Calling club service to remove user {} from club {}", prn, clubName);

        try {
            webClientBuilder.build()
                    .delete()
                    .uri(clubServiceUrl + "/user-clubs/user/{prn}/club/{clubName}", prn, clubName)
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();

            log.info("Successfully removed user {} from club {}", prn, clubName);
        } catch (WebClientResponseException e) {
            log.error("Error removing user {} from club {}: {} - {}",
                    prn, clubName, e.getStatusCode(), e.getMessage());
            throw new RuntimeException("Failed to remove user from club: " + clubName, e);
        } catch (Exception e) {
            log.error("Unexpected error removing user {} from club {}: {}",
                    prn, clubName, e.getMessage());
            throw new RuntimeException("Failed to remove user from club: " + clubName, e);
        }
    }

    /**
     * Get all club names a user belongs to (lightweight)
     */
    public List<String> getUserClubNames(String prn) {
        String authHeader = request.getHeader("Authorization");
        log.debug("Fetching club names for user: {}", prn);

        try {
            List<String> clubNames = webClientBuilder.build()
                    .get()
                    .uri(clubServiceUrl + "/user-clubs/user/{prn}/club-names", prn)
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(ApiResponseWrapper.class)
                    .map(response -> (List<String>) response.getData())
                    .block();

            return clubNames != null ? clubNames : List.of();
        } catch (Exception e) {
            log.error("Error fetching club names for user {}: {}", prn, e.getMessage());
            return List.of();
        }
    }

    /**
     * Helper class to deserialize API response
     */
    @lombok.Data
    private static class ApiResponseWrapper {
        private boolean success;
        private String message;
        private Object data;
    }
}