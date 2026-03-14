package com.clubHouse.notification_service2.client;

import com.clubHouse.notification_service2.config.CacheConfig;
import com.clubHouse.notification_service2.dto.ApiResponse;
import com.clubHouse.notification_service2.dto.response.DepartmentResponse;
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

    // ── Header helper ─────────────────────────────────────────────────────────

    private WebClient.RequestHeadersSpec<?> withForwardedHeaders(WebClient.RequestHeadersSpec<?> spec) {
        String auth   = request.getHeader("Authorization");
        String userId = request.getHeader("X-User-Id");
        String role   = request.getHeader("X-User-Role");
        if (auth   != null) spec = spec.header("Authorization", auth);
        if (userId != null) spec = spec.header("X-User-Id",     userId);
        if (role   != null) spec = spec.header("X-User-Role",   role);
        return spec;
    }

    // ── Cached: departments are essentially static data ───────────────────────

    @Cacheable(value = CacheConfig.DEPARTMENTS_LIST_CACHE, key = "'all'", unless = "#result == null || #result.isEmpty()")
    public List<DepartmentResponse> getAll() {
        try {
            log.info("Fetching all departments from independent-service (cache miss)");

            ApiResponse<List<DepartmentResponse>> response = withForwardedHeaders(
                    webClientBuilder.build()
                            .get()
                            .uri(independentServiceUrl + "/department"))
                    .retrieve()
                    .onStatus(
                            status -> status.isError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .doOnNext(body -> log.warn(
                                            "Independent service returned {} for getAll departments: {}",
                                            clientResponse.statusCode(), body))
                                    .then(reactor.core.publisher.Mono.empty())
                    )
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<List<DepartmentResponse>>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .onErrorResume(e -> {
                        log.warn("getAll departments failed, returning null: {}", e.getMessage());
                        return reactor.core.publisher.Mono.empty();
                    })
                    .block();

            if (response != null && Boolean.TRUE.equals(response.getSuccess()) && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response from getAll departments");
            return null; // null prevents caching — retried on next call

        } catch (Exception e) {
            log.error("getAll departments failed unexpectedly, returning null", e);
            return null;
        }
    }

    @Cacheable(value = CacheConfig.DEPARTMENT_CACHE, key = "#id", unless = "#result == null")
    public DepartmentResponse getDepartmentById(Long id) {
        try {
            log.info("Fetching department id={} from independent-service (cache miss)", id);

            ApiResponse<DepartmentResponse> response = withForwardedHeaders(
                    webClientBuilder.build()
                            .get()
                            .uri(independentServiceUrl + "/department/{id}", id))
                    .retrieve()
                    .onStatus(
                            status -> status.isError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .doOnNext(body -> log.warn(
                                            "Independent service returned {} for departmentId={}: {}",
                                            clientResponse.statusCode(), id, body))
                                    .then(reactor.core.publisher.Mono.empty())
                    )
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<DepartmentResponse>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .onErrorResume(e -> {
                        log.warn("getDepartmentById id={} failed, returning null: {}", id, e.getMessage());
                        return reactor.core.publisher.Mono.empty();
                    })
                    .block();

            if (response != null && Boolean.TRUE.equals(response.getSuccess()) && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response for departmentId={}", id);
            return null;

        } catch (Exception e) {
            log.error("getDepartmentById id={} failed unexpectedly, returning null", id, e);
            return null;
        }
    }

    public List<DepartmentResponse> getDepartmentByIds(List<Long> ids) {
        try {
            log.info("Fetching departments by ids={} from independent-service", ids);

            ApiResponse<List<DepartmentResponse>> response = withForwardedHeaders(
                    webClientBuilder.build()
                            .post()
                            .uri(independentServiceUrl + "/department/ids")
                            .bodyValue(ids))
                    .retrieve()
                    .onStatus(
                            status -> status.isError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .doOnNext(body -> log.warn(
                                            "Independent service returned {} for getDepartmentByIds: {}",
                                            clientResponse.statusCode(), body))
                                    .then(reactor.core.publisher.Mono.empty())
                    )
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<List<DepartmentResponse>>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .onErrorResume(e -> {
                        log.warn("getDepartmentByIds failed, returning empty list: {}", e.getMessage());
                        return reactor.core.publisher.Mono.empty();
                    })
                    .block();

            if (response != null && Boolean.TRUE.equals(response.getSuccess()) && response.getData() != null) {
                return response.getData();
            }

            log.warn("Invalid or empty response from getDepartmentByIds");
            return List.of();

        } catch (Exception e) {
            log.error("getDepartmentByIds failed unexpectedly, returning empty list", e);
            return List.of();
        }
    }

    // ── Cache eviction ────────────────────────────────────────────────────────

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