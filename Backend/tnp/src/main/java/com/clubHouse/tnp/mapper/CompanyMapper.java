package com.clubHouse.tnp.mapper;

import com.clubHouse.tnp.dto.response.CombinedResponse;
import com.clubHouse.tnp.dto.response.CompanyResponse;
import com.clubHouse.tnp.model.Company;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class CompanyMapper {

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

    public static List<CompanyResponse> toResponseList(List<Company> companies) {
        if (companies == null || companies.isEmpty()) return List.of();
        return companies.stream().map(CompanyMapper::toResponse).toList();
    }

    public static CompanyResponse toResponse(Company company) {
        if (company == null) return null;

        return CompanyResponse.builder()
                .companyId(company.getCompanyId())
                .name(company.getName())
                .industry(company.getIndustry() != null ? company.getIndustry().getName() : null)
                .packageOffered(company.getPackageOffered())
                .academicSession(company.getAcademicSession() != null ?
                        company.getAcademicSession().getAcademicSession() : null)
                .studentsHired(company.getStudentsHired())
                .build();
    }

    public static CombinedResponse toCombinedResponse(String name, List<Company> companies) {
        if (companies == null || companies.isEmpty()) return null;

        Company first = companies.get(0);

        List<Double> packages = companies.stream()
                .map(Company::getPackageOffered)
                .distinct()
                .sorted()
                .toList();

        // Sum up students hired across all entries for this company
        Integer totalHired = companies.stream()
                .map(Company::getStudentsHired)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum();

        return CombinedResponse.builder()
                .companyId(first.getCompanyId())
                .name(first.getName())
                .industry(first.getIndustry() != null ? first.getIndustry().getName() : null)
                .packageOffered(packages)
                .academicSession(first.getAcademicSession() != null ?
                        first.getAcademicSession().getAcademicSession() : null)
                .studentsHired(totalHired)
                .build();
    }
}