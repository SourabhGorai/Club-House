package com.independent.independent_services.repository;

import com.independent.independent_services.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Department findByName(String sanitizedName);

    List<Department> findByIdIn(List<Long> ids);
}
