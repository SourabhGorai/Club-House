package com.clubHouse.notification_service2.client;


import com.clubHouse.notification_service2.dto.ApiResponse;
import com.clubHouse.notification_service2.dto.response.DepartmentResponse;
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

@Slf4j
@Component
@RequiredArgsConstructor
public class IndependentServiceClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${app.independent-service.url}")
    private String independentServiceUrl;
    private final HttpServletRequest request;

    public List<DepartmentResponse> getAll() {
        String authHeader = request.getHeader("Authorization");
        try {
            log.info("Attempting to fetch departments, from profile-service");

            ApiResponse<List<DepartmentResponse>> response = webClientBuilder.build()
                    .get()
                    .uri(independentServiceUrl + "/department")
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference
                            <ApiResponse<List<DepartmentResponse>>>() {
                    })
                    .timeout(Duration.ofSeconds(5))
                    .block();

            if (response != null && response.getSuccess() && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response");
            return null;

        } catch (Exception e) {
            log.error("Failed to get departments", e);
            throw new ExternalServiceException("Unable to validate role. Please try again later", e);
        }
    }

    public DepartmentResponse getDepartmentById(Long id) {
        String authHeader = request.getHeader("Authorization");
        try {
            log.info("Attempting to fetch department for PRN: {}, from profile-service",
                    id);

            ApiResponse<DepartmentResponse> response = webClientBuilder.build()
                    .get()
                    .uri(independentServiceUrl + "/department/{id}", id)
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference
                            <ApiResponse<DepartmentResponse>>() {
                    })
                    .timeout(Duration.ofSeconds(5))
                    .block();

            if (response != null && response.getSuccess() && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response");
            return null;

        } catch (Exception e) {
            log.error("Failed to get department for PRN: {}", id, e);
            throw new ExternalServiceException("Unable to validate role. Please try again later", e);
        }
    }

    public List<DepartmentResponse> getDepartmentByIds(List<Long> ids) {

        String authHeader = request.getHeader("Authorization");

        try {
            log.info("Attempting to fetch departments from independent-service for IDs: {}", ids);

            ApiResponse<List<DepartmentResponse>> response = webClientBuilder.build()
                    .post()
                    .uri(independentServiceUrl + "/department/ids")
                    .header("Authorization", authHeader)
                    .bodyValue(ids)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<
                            ApiResponse<List<DepartmentResponse>>>() {
                    })
                    .timeout(Duration.ofSeconds(5))
                    .block();

            if (response != null && Boolean.TRUE.equals(response.getSuccess())
                    && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response from independent-service");
            return List.of();

        } catch (Exception e) {
            log.error("Failed to get departments from independent-service", e);
            throw new ExternalServiceException(
                    "Unable to fetch department. Please try again later", e);
        }
    }


}