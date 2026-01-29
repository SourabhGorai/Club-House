package com.independent.independent_services.mapper;

import com.independent.independent_services.dto.DepartmentResponse;
import com.independent.independent_services.model.Department;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class DepartmentMapper {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

    public static String sanitizeName(String departmentName) {
        if (departmentName == null || departmentName.isBlank()) {
            return null;
        }

        return departmentName.trim()
                .replaceAll("\\s+", " ")
                .replaceAll("[^a-zA-Z0-9 ]", "")
                .toUpperCase();
    }

    public static List<DepartmentResponse> toResponseList(List<Department> depts) {
        if(depts == null || depts.isEmpty()){
            return List.of();
        }

        return depts.stream()
                .map(DepartmentMapper::toResponse)
                .collect(Collectors.toList());

    }

    public static DepartmentResponse toResponse(Department dept) {
        if(dept == null) return null;

        return DepartmentResponse.builder()
                .departmentId(dept.getDepartmentId())
                .name(dept.getName())
                .isActive(!dept.isDeleted())
                .build();
    }

}
