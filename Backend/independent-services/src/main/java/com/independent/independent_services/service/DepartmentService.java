package com.independent.independent_services.service;

import com.independent.independent_services.config.CacheConfig;
import com.independent.independent_services.dto.DepartmentResponse;
import com.independent.independent_services.exception.NotFoundException;
import com.independent.independent_services.mapper.DepartmentMapper;
import com.independent.independent_services.model.Department;
import com.independent.independent_services.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Caching(evict = {
            @CacheEvict(value = CacheConfig.DEPARTMENTS_LIST_CACHE, allEntries = true)
    }, put = {
            @CachePut(value = CacheConfig.DEPARTMENT_CACHE, key = "#result.departmentId")
    })
    public DepartmentResponse addDepartment(String name) {

        log.info("Attempting to add department: {}", name);

        String sanitizedName = DepartmentMapper.sanitizeName(name);

        Department exists = departmentRepository.findByName(sanitizedName);

        if (exists != null) {
            if (exists.isDeleted()) {
                log.warn("Department found but deleted. Reactivating: {}", sanitizedName);
                exists.activate();
                Department saved = departmentRepository.save(exists);
                return DepartmentMapper.toResponse(saved);
            }

            log.warn("Department already exists and is active: {}", sanitizedName);
            return DepartmentMapper.toResponse(exists);
        }

        Department dept = Department.builder()
                .name(sanitizedName)
                .build();

        Department saved = departmentRepository.save(dept);
        return DepartmentMapper.toResponse(saved);
    }

    @Cacheable(value = CacheConfig.DEPARTMENTS_LIST_CACHE, key = "'all'")
    public List<DepartmentResponse> getAll() {

        log.info("Attempting to fetch all the departments - Cache miss, fetching from DB");

        List<Department> list = departmentRepository.findAll();

        return DepartmentMapper.toResponseList(list);

    }

    @Cacheable(value = CacheConfig.DEPARTMENT_CACHE, key = "#id")
    public DepartmentResponse getById(Long id) {

        log.info("Attempting to fetch department with ID: {} - Cache miss, fetching from DB", id);

        Department resp = departmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Department", id.toString()));

        return DepartmentMapper.toResponse(resp);

    }

    public List<DepartmentResponse> getByIds(List<Long> ids) {

        log.info("Attempting to fetch departments with ids: {}", ids);

        if (ids == null || ids.isEmpty()) {
            log.warn("Empty department id list received");
            return List.of();
        }

        List<Department> list = departmentRepository.findByDepartmentIdIn(ids);

        return DepartmentMapper.toResponseList(list);

    }

    @Caching(evict = {
            @CacheEvict(value = CacheConfig.DEPARTMENT_CACHE, key = "#id"),
            @CacheEvict(value = CacheConfig.DEPARTMENTS_LIST_CACHE, allEntries = true)
    })
    public DepartmentResponse delete(Long id) {

        log.info("Attemping to delete department with ID: {}", id);

        Department dept = departmentRepository.findById(id).orElseThrow();

        dept.delete();
        Department saved = departmentRepository.save(dept);

        return DepartmentMapper.toResponse(saved);

    }
}