package com.clubHouse.tnp.mapper;

import com.clubHouse.tnp.dto.response.CompanyMasterResponse;
import com.clubHouse.tnp.model.CompanyMaster;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CompanyMasterMapper {

    public static String sanitizeCompanyName(String input) {
        if (input == null || input.trim().isEmpty()) {
            return null;
        }

        // 1. Normalize unicode (remove accents)
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        // 2. Handle camelCase → camel Case
        normalized = normalized.replaceAll("([a-z])([A-Z])", "$1 $2");

        // 3. Replace underscores, hyphens with space
        normalized = normalized.replaceAll("[_\\-]+", " ");

        // 4. Remove unwanted characters
        normalized = normalized.replaceAll("[^a-zA-Z0-9 ]", "");

        // 5. Convert to lowercase first
        normalized = normalized.toLowerCase();

        // 6. Capitalize each word
        return Arrays.stream(normalized.trim().split("\\s+"))
                .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1))
                .collect(Collectors.joining(" "));
    }

    public static CompanyMasterResponse toResponse(CompanyMaster company){

        if(company == null) return null;

        return CompanyMasterResponse.builder()
                .companyMasterId(company.getCompanyMasterId())
                .name(company.getName())
                .industry(company.getIndustry().getName())
                .logoUrl(company.getLogoUrl())
                .build();

    }

    public static List<CompanyMasterResponse> toResponseList(List<CompanyMaster> companies){

        if(companies == null || companies.isEmpty()) return List.of();

        return companies.stream()
                .map(CompanyMasterMapper::toResponse)
                .toList();

    }

}
