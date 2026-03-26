package com.clubHouse.tnp.mapper;

import com.clubHouse.tnp.dto.response.IndustryResponse;
import com.clubHouse.tnp.dto.response.VisitYearResponse;
import com.clubHouse.tnp.model.Industry;
import com.clubHouse.tnp.model.VisitYear;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.List;

@Component
public class IndustryMapper {

    public static IndustryResponse toResponse(Industry industry){

        if(industry == null) return null;

        return IndustryResponse.builder()
                .industryId(industry.getIndustryId())
                .name(industry.getName())
                .build();

    }

    public static List<IndustryResponse> toResponseList(List<Industry> industries){

        if(industries == null || industries.isEmpty()) return List.of();

        return industries.stream()
                .map(IndustryMapper::toResponse)
                .toList();

    }

    public static String sanitizeIndustry(String input) {
        if (input == null || input.trim().isEmpty()) {
            return null;
        }

        // 1. Normalize (remove accents, special unicode chars)
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        // 2. Handle camelCase → camel Case
        normalized = normalized.replaceAll("([a-z])([A-Z])", "$1-$2");

        // 3. Replace spaces, underscores, multiple hyphens → single hyphen
        normalized = normalized.replaceAll("[\\s_]+", "-");

        // 4. Remove all non-alphanumeric except hyphen
        normalized = normalized.replaceAll("[^a-zA-Z0-9-]", "");

        // 5. Collapse multiple hyphens → single
        normalized = normalized.replaceAll("-{2,}", "-");

        // 6. Trim hyphens from start/end
        normalized = normalized.replaceAll("^-|-$", "");

        // 7. Convert to UPPERCASE
        return normalized.toUpperCase();
    }

}
