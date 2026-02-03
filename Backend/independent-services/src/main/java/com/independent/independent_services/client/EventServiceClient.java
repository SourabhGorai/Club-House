//package com.independent.independent_services.client;
//
//import com.independent.independent_services.dto.ApiResponse;
//import com.independent.independent_services.dto.EventResponse;
//import com.independent.independent_services.exception.ExternalServiceException;
//import jakarta.servlet.http.HttpServletRequest;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.core.ParameterizedTypeReference;
//import org.springframework.stereotype.Component;
//import org.springframework.web.reactive.function.client.WebClient;
//
//import java.time.Duration;
//import java.util.List;
//
//@Slf4j
//@Component
//@RequiredArgsConstructor
//public class EventServiceClient {
//
//    private final WebClient.Builder webClientBuilder;
//
//    @Value("${app.event-service.url}")
//    private String eventServiceUrl;
//    private final HttpServletRequest request;
//
//    public List<EventResponse> getEventsByIdList(List<Long> eventIds) {
//        String authHeader = request.getHeader("Authorization");
//        try {
//            log.info("Attempting to fetch events for Ids: {}, call from event-service",
//                    eventIds);
//
//            ApiResponse<List<EventResponse>> response = webClientBuilder.build()
//                    .post()
//                    .uri(eventServiceUrl + "/profiles")
//                    .header("Authorization", authHeader)
//                    .bodyValue(eventIds)
//                    .retrieve()
//                    .bodyToMono(new ParameterizedTypeReference<ApiResponse
//                            <List<EventResponse>>>() {})
//                    .timeout(Duration.ofSeconds(5))
//                    .block();
//
//            if (response != null && response.getSuccess() && response.getData() != null) {
//                return response.getData();
//            }
//
//            log.warn("Invalid or empty response from event-service");
//            return List.of();
//
//        } catch (Exception e) {
//            log.error("Failed to fetch events from event-service");
//            throw new ExternalServiceException("Failed to fetch events. Please try again later", e);
//        }
//    }
//
//    public EventResponse getEventById(Long id) {
//
//        String authHeader = request.getHeader("Authorization");
//
//        try {
//            log.info("Attempting to fetch event for ID: {}", id);
//
//            ApiResponse<EventResponse> response = webClientBuilder.build()
//                    .get()
//                    .uri(eventServiceUrl + "/getById/{eventId}", id)
//                    .header("Authorization", authHeader)
//                    .retrieve()
//                    .bodyToMono(new ParameterizedTypeReference<
//                            ApiResponse<EventResponse>>() {})
//                    .timeout(Duration.ofSeconds(5))
//                    .block();
//
//            if (response != null && Boolean.TRUE.equals(response.getSuccess())
//                    && response.getData() != null) {
//                return response.getData();
//            }
//
//            log.warn("Invalid or empty response from event-service");
//            return null;
//
//        } catch (Exception e) {
//            log.error("Failed to get event for ID: {}", id, e);
//            throw new ExternalServiceException(
//                    "Unable to fetch event. Please try again later", e);
//        }
//    }
//
//
//}