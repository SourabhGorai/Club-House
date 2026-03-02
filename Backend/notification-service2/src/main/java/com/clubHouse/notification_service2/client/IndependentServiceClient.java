package com.clubHouse.notification_service2.client;

import com.clubHouse.notification_service2.config.CacheConfig;
import com.clubHouse.notification_service2.dto.ApiResponse;
import com.clubHouse.notification_service2.dto.response.DepartmentResponse;
import com.clubHouse.notification_service2.exception.ExternalServiceException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
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
    private final HttpServletRequest request;

    @Value("${app.independent-service.url}")
    private String independentServiceUrl;

    // ── Cached: departments are essentially static data ───────────────────────

    /**
     * All departments — cached as a single entry.
     * Key is the literal string "all" since there's only one list.
     */
    @Cacheable(value = CacheConfig.DEPARTMENTS_LIST_CACHE, key = "'all'", unless = "#result == null || #result.isEmpty()")
    public List<DepartmentResponse> getAll() {
        String authHeader = request.getHeader("Authorization");
        try {
            log.info("Fetching all departments from independent-service (cache miss)");

            ApiResponse<List<DepartmentResponse>> response = webClientBuilder.build()
                    .get()
                    .uri(independentServiceUrl + "/department")
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<List<DepartmentResponse>>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .block();

            if (response != null && response.getSuccess() && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response from getAll departments");
            return null;

        } catch (Exception e) {
            log.error("Failed to get all departments", e);
            throw new ExternalServiceException("Unable to fetch departments. Please try again later", e);
        }
    }

    /**
     * Single department by ID — cached individually.
     */
    @Cacheable(value = CacheConfig.DEPARTMENT_CACHE, key = "#id", unless = "#result == null")
    public DepartmentResponse getDepartmentById(Long id) {
        String authHeader = request.getHeader("Authorization");
        try {
            log.info("Fetching department id={} from independent-service (cache miss)", id);

            ApiResponse<DepartmentResponse> response = webClientBuilder.build()
                    .get()
                    .uri(independentServiceUrl + "/department/{id}", id)
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<DepartmentResponse>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .block();

            if (response != null && response.getSuccess() && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response for departmentId={}", id);
            return null;

        } catch (Exception e) {
            log.error("Failed to get department id={}", id, e);
            throw new ExternalServiceException("Unable to fetch department. Please try again later", e);
        }
    }

    /**
     * Bulk department fetch — NOT cached at this level because the combination of IDs
     * varies per call. Individual results are already cached by {@link #getDepartmentById}.
     * If you need bulk caching, populate the per-ID cache here after fetching.
     */
    public List<DepartmentResponse> getDepartmentByIds(List<Long> ids) {
        String authHeader = request.getHeader("Authorization");
        try {
            log.info("Fetching departments by ids={} from independent-service", ids);

            ApiResponse<List<DepartmentResponse>> response = webClientBuilder.build()
                    .post()
                    .uri(independentServiceUrl + "/department/ids")
                    .header("Authorization", authHeader)
                    .bodyValue(ids)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<List<DepartmentResponse>>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .block();

            if (response != null && Boolean.TRUE.equals(response.getSuccess()) && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response from getDepartmentByIds");
            return List.of();

        } catch (Exception e) {
            log.error("Failed to get departments by ids", e);
            throw new ExternalServiceException("Unable to fetch departments. Please try again later", e);
        }
    }

    // ── Cache eviction — call these if a department is updated externally ─────

    /**
     * Evicts both the individual entry and the full list cache,
     * since the list may now be stale too.
     */
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.DEPARTMENT_CACHE, key = "#id"),
            @CacheEvict(value = CacheConfig.DEPARTMENTS_LIST_CACHE, key = "'all'")
    })
    public void evictDepartmentCache(Long id) {
        log.info("Evicted department cache for id={}", id);
    }

    @CacheEvict(value = CacheConfig.DEPARTMENTS_LIST_CACHE, key = "'all'")
    public void evictAllDepartmentsCache() {
        log.info("Evicted all-departments list cache");
    }
}