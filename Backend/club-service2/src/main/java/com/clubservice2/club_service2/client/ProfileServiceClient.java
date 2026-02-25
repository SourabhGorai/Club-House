package com.clubservice2.club_service2.client;

import com.clubservice2.club_service2.dto.request.BulkProfileFetchRequest;
import com.clubservice2.club_service2.dto.request.FilterPrnsRequest;
import com.clubservice2.club_service2.dto.response.ApiResponseWrapper;
import com.clubservice2.club_service2.dto.response.FilterPrnsResponse;
import com.clubservice2.club_service2.dto.response.ProfileResponse;
import com.clubservice2.club_service2.dto.response.ProfileSummaryResponse;
import com.clubservice2.club_service2.exception.ExternalServiceException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileServiceClient {

    private final WebClient profileServiceWebClient;
    private final HttpServletRequest request;
    private final ObjectMapper objectMapper;

    /**
     * Fetches user profile summary by PRN
     */
    public ProfileSummaryResponse getProfileSummary(String prn) {
        String authHeader = request.getHeader("Authorization");

        log.debug("Fetching profile summary for PRN: {}", prn);

        try {
            // Use ParameterizedTypeReference to properly deserialize the generic ApiResponseWrapper
            ApiResponseWrapper<ProfileSummaryResponse> response = profileServiceWebClient.get()
                    .uri("/api/profiles/summary/{prn}", prn)
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponseWrapper<ProfileSummaryResponse>>() {})
                    .block();

            if (response == null || response.getData() == null) {
                log.warn("Profile service returned null for PRN: {}", prn);
                return createFallbackProfile(prn);
            }

            log.debug("Successfully fetched profile for PRN: {} - Name: {}, Dept: {}, Year: {}",
                    prn, response.getData().getFullName(),
                    response.getData().getDepartment(),
                    response.getData().getYear());

            return response.getData();

        } catch (WebClientResponseException e) {
            log.warn("Failed to fetch profile for PRN {}: {} - {}",
                    prn, e.getStatusCode(), e.getResponseBodyAsString());
            return createFallbackProfile(prn);
        } catch (Exception e) {
            log.error("Unexpected error fetching profile for PRN: {}", prn, e);
            return createFallbackProfile(prn);
        }
    }

    /**
     * Fetches multiple profile summaries in bulk
     * This is more efficient than calling getProfileSummary() multiple times
     */
//    public Map<String, ProfileSummaryResponse> getProfileSummariesBulk(List<String> prns) {
//        if (prns == null || prns.isEmpty()) {
//            log.debug("Empty PRN list provided for bulk fetch");
//            return Collections.emptyMap();
//        }
//
//        String authHeader = request.getHeader("Authorization");
//
//        log.debug("Fetching {} profile summaries in bulk", prns.size());
//
//        try {
//            BulkProfileFetchRequest bulkRequest = BulkProfileFetchRequest.builder()
//                    .prns(prns)
//                    .build();
//
//            // Use ParameterizedTypeReference for the wrapped list response
//            ApiResponseWrapper<List<ProfileResponse>> response = profileServiceWebClient.post()
//                    .uri("/api/profiles/bulk")
//                    .header("Authorization", authHeader)
//                    .bodyValue(bulkRequest)
//                    .retrieve()
//                    .bodyToMono(new ParameterizedTypeReference<ApiResponseWrapper<List<ProfileResponse>>>() {})
//                    .block();
//
//            if (response == null || response.getData() == null) {
//                log.warn("Profile service returned null for bulk fetch");
//                return createFallbackProfileMap(prns);
//            }
//
//            List<ProfileResponse> profiles = response.getData();
//            log.debug("Received {} profiles from bulk fetch", profiles.size());
//
//            Map<String, ProfileSummaryResponse> profileMap = new HashMap<>();
//
//            for (ProfileResponse profile : profiles) {
//                ProfileSummaryResponse summary = convertToSummary(profile);
//                profileMap.put(profile.getPrn(), summary);
//                log.debug("Added profile: {} - {} - {}",
//                        profile.getPrn(), profile.getFullName(), profile.getDepartment());
//            }
//
//            log.debug("Successfully fetched {} profiles out of {} requested",
//                    profileMap.size(), prns.size());
//
//            // Add fallback profiles for missing PRNs
//            prns.forEach(prn -> {
//                if (!profileMap.containsKey(prn)) {
//                    log.warn("Profile not found for PRN: {}, using fallback", prn);
//                    profileMap.put(prn, createFallbackProfile(prn));
//                }
//            });
//
//            return profileMap;
//
//        } catch (WebClientResponseException e) {
//            log.error("Profile service error during bulk fetch: {} - Response: {}",
//                    e.getStatusCode(), e.getResponseBodyAsString());
//            return createFallbackProfileMap(prns);
//        } catch (Exception e) {
//            log.error("Unexpected error during bulk profile fetch: {}", e.getMessage(), e);
//            return createFallbackProfileMap(prns);
//        }
//    }

    /**
     * Fetches multiple profile summaries in bulk
     * This is more efficient than calling getProfileSummary() multiple times
     * Automatically batches requests if more than 100 PRNs are provided
     */
    public Map<String, ProfileSummaryResponse> getProfileSummariesBulk(List<String> prns) {
        if (prns == null || prns.isEmpty()) {
            log.debug("Empty PRN list provided for bulk fetch");
            return Collections.emptyMap();
        }

        log.debug("Fetching {} profile summaries in bulk", prns.size());

        // If more than 100 PRNs, batch the requests
        if (prns.size() > 100) {
            return getProfileSummariesInBatches(prns);
        }

        // Single batch processing (100 or fewer PRNs)
        return fetchSingleBatch(prns);
    }

    /**
     * Fetches profiles in batches of 100
     */
    private Map<String, ProfileSummaryResponse> getProfileSummariesInBatches(List<String> prns) {
        final int BATCH_SIZE = 100;
        Map<String, ProfileSummaryResponse> allProfiles = new HashMap<>();

        log.info("Splitting {} PRNs into batches of {}", prns.size(), BATCH_SIZE);

        for (int i = 0; i < prns.size(); i += BATCH_SIZE) {
            int end = Math.min(i + BATCH_SIZE, prns.size());
            List<String> batch = prns.subList(i, end);

            log.debug("Fetching batch {}-{} of {}", i + 1, end, prns.size());

            Map<String, ProfileSummaryResponse> batchProfiles = fetchSingleBatch(batch);
            allProfiles.putAll(batchProfiles);
        }

        log.info("Successfully fetched {} profiles across {} batches",
                allProfiles.size(), (prns.size() + BATCH_SIZE - 1) / BATCH_SIZE);

        return allProfiles;
    }

    /**
     * Fetches a single batch of profiles (100 or fewer)
     */
    private Map<String, ProfileSummaryResponse> fetchSingleBatch(List<String> prns) {
        String authHeader = request.getHeader("Authorization");

        try {
            BulkProfileFetchRequest bulkRequest = BulkProfileFetchRequest.builder()
                    .prns(prns)
                    .build();

            ApiResponseWrapper<List<ProfileResponse>> response = profileServiceWebClient.post()
                    .uri("/api/profiles/bulk")
                    .header("Authorization", authHeader)
                    .bodyValue(bulkRequest)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponseWrapper<List<ProfileResponse>>>() {})
                    .block();

            if (response == null || response.getData() == null) {
                log.warn("Profile service returned null for bulk fetch");
                return createFallbackProfileMap(prns);
            }

            List<ProfileResponse> profiles = response.getData();
            log.debug("Received {} profiles from batch fetch", profiles.size());

            Map<String, ProfileSummaryResponse> profileMap = new HashMap<>();

            for (ProfileResponse profile : profiles) {
                ProfileSummaryResponse summary = convertToSummary(profile);
                profileMap.put(profile.getPrn(), summary);
            }

            // Add fallback profiles for missing PRNs in this batch
            prns.forEach(prn -> {
                if (!profileMap.containsKey(prn)) {
                    log.warn("Profile not found for PRN: {}, using fallback", prn);
                    profileMap.put(prn, createFallbackProfile(prn));
                }
            });

            return profileMap;

        } catch (WebClientResponseException e) {
            log.error("Profile service error during batch fetch: {} - Response: {}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            return createFallbackProfileMap(prns);
        } catch (Exception e) {
            log.error("Unexpected error during batch profile fetch: {}", e.getMessage(), e);
            return createFallbackProfileMap(prns);
        }
    }

    /**
     * Filters PRNs by academic year
     */
    public List<String> filterPrnsByYear(List<String> prns, Integer year) {
        String authHeader = request.getHeader("Authorization");

        log.debug("Filtering {} PRNs by year: {}", prns.size(), year);

        FilterPrnsRequest filterRequest = FilterPrnsRequest.builder()
                .prns(prns)
                .year(year)
                .build();

        try {
            // This endpoint doesn't use ApiResponse wrapper based on your controller
            FilterPrnsResponse response = profileServiceWebClient.post()
                    .uri("/api/profiles/filter/prns")
                    .header("Authorization", authHeader)
                    .bodyValue(filterRequest)
                    .retrieve()
                    .bodyToMono(FilterPrnsResponse.class)
                    .block();

            if (response == null || response.getFilteredPrns() == null) {
                log.warn("Profile service returned null response for PRN filtering");
                return Collections.emptyList();
            }

            log.debug("Filtered {} PRNs to {} for year {}",
                    prns.size(), response.getFilteredPrns().size(), year);
            return response.getFilteredPrns();

        } catch (WebClientResponseException e) {
            log.error("Profile service error during PRN filtering: {} - {}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new ExternalServiceException("Profile Service",
                    String.format("Failed to filter PRNs by year. Status: %s", e.getStatusCode()), e);
        } catch (Exception e) {
            log.error("Unexpected error filtering PRNs by year", e);
            throw new ExternalServiceException("Profile Service",
                    "Unexpected error during PRN filtering", e);
        }
    }

    /**
     * Fetches profile image by PRN
     */
    public byte[] getProfileImage(String prn) {
        String authHeader = request.getHeader("Authorization");

        log.debug("Fetching profile image for PRN: {}", prn);

        try {
            byte[] image = profileServiceWebClient.get()
                    .uri("/api/profiles/{prn}/image", prn)
                    .header("Authorization", authHeader)
                    .retrieve()
                    .bodyToMono(byte[].class)
                    .block();

            log.debug("Successfully fetched image for PRN: {}", prn);
            return image;

        } catch (WebClientResponseException e) {
            log.warn("Failed to fetch image for PRN {}: {}", prn, e.getStatusCode());
            return null;
        } catch (Exception e) {
            log.error("Unexpected error fetching image for PRN: {}", prn, e);
            return null;
        }
    }

    public Map<String, String> getImageUrlsByPrns(List<String> prns) {
        if (prns == null || prns.isEmpty()) {
            return Collections.emptyMap();
        }

        String authHeader = request.getHeader("Authorization");
        log.debug("Fetching image URLs for {} PRNs", prns.size());

        try {
            ApiResponseWrapper<Map<String, String>> response = profileServiceWebClient.post()
                    .uri("/api/profiles/image-urls")
                    .header("Authorization", authHeader)
                    .bodyValue(prns)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponseWrapper<Map<String, String>>>() {})
                    .block();

            if (response == null || response.getData() == null) {
                log.warn("Profile service returned null for image URLs fetch");
                return Collections.emptyMap();
            }

            return response.getData();

        } catch (WebClientResponseException e) {
            log.error("Profile service error fetching image URLs: {} - {}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            return Collections.emptyMap();
        } catch (Exception e) {
            log.error("Unexpected error fetching image URLs: {}", e.getMessage(), e);
            return Collections.emptyMap();
        }
    }

    // ========== Private Helper Methods ==========

    /**
     * Converts ProfileResponse to ProfileSummaryResponse
     */
    private ProfileSummaryResponse convertToSummary(ProfileResponse profile) {
        return ProfileSummaryResponse.builder()
                .prn(profile.getPrn())
                .fullName(profile.getFullName())
                .department(profile.getDepartment())
                .year(profile.getYear())
                .hasProfileImage(profile.getHasProfileImage())
                .build();
    }

    /**
     * Creates a fallback profile when profile service is unavailable
     */
    private ProfileSummaryResponse createFallbackProfile(String prn) {
        log.debug("Creating fallback profile for PRN: {}", prn);
        return ProfileSummaryResponse.builder()
                .prn(prn)
                .fullName("N/A")
                .department("N/A")
                .year(null)
                .hasProfileImage(false)
                .build();
    }

    /**
     * Creates fallback profiles for multiple PRNs
     */
    private Map<String, ProfileSummaryResponse> createFallbackProfileMap(List<String> prns) {
        return prns.stream()
                .collect(Collectors.toMap(
                        prn -> prn,
                        this::createFallbackProfile
                ));
    }
}