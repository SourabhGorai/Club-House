package com.clubHouse.notification_service2.client;

import com.clubHouse.notification_service2.dto.ApiResponse;
import com.clubHouse.notification_service2.dto.response.EventResponse;
import com.clubHouse.notification_service2.dto.response.ProfileResponse;
import com.clubHouse.notification_service2.exception.ExternalServiceException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventServiceClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${app.event-service.url}")
    private String eventServiceUrl;
    private final HttpServletRequest request;

    public Map<EventResponse, String> getMyEnrolledEvents() {
        String authHeader = request.getHeader("Authorization");
        try {
            log.info("Attempting to fetch my enrolled events");

            ApiResponse<Map<EventResponse, String>> response = webClientBuilder.build()
                    .get()
                    .uri(eventServiceUrl + "/enrollments/myEnrollments")
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference
                            <ApiResponse<Map<EventResponse, String>>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .block();

            if (response != null && response.getSuccess() && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response");
            return null;

        } catch (Exception e) {
            log.error("Failed to get my enrolled events", e);
            throw new ExternalServiceException("Unable to get event. Please try again later", e);
        }
    }

    public EventResponse getEventById(Long id) {
        String authHeader = request.getHeader("Authorization");
        try {
            log.info("Attempting to fetch event with Id: {}, from notification-service",
                    id);

            ApiResponse<EventResponse> response = webClientBuilder.build()
                    .get()
                    .uri(eventServiceUrl + "/events/getById/{eventId}", id)
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<EventResponse>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .block();

            if (response != null && response.getSuccess() && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response");
            return null;

        } catch (Exception e) {
            log.error("Failed to get event with ID: {}", id, e);
            throw new ExternalServiceException("Unable to get event. Please try again later", e);
        }
    }

    // will need get events in which i am enrolled right now and isCompleted false

}