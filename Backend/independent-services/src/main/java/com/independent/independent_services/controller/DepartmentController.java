package com.independent.independent_services.controller;

import com.independent.independent_services.dto.ApiResponse;
import com.independent.independent_services.dto.DepartmentResponse;
import com.independent.independent_services.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/department")
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping("/{name}")
    public ResponseEntity<ApiResponse<DepartmentResponse>> addDepartment(@PathVariable String name) {

        log.info("REST received to add department");

        DepartmentResponse resp = departmentService.addDepartment(name);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Successfully added %s", name),
                resp
        ));

    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getAll(){

        log.info("REST received to fetch all departments");

        List<DepartmentResponse> list = departmentService.getAll();

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched list of size %d", list.size()),
                list
        ));

    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentResponse>> getById(@PathVariable Long id) {

        log.info("REST received to fetch department with ID: {}", id);

        DepartmentResponse resp = departmentService.getById(id);

        return ResponseEntity.ok(ApiResponse.success(
                "Found department",
                resp
        ));

    }

    @PostMapping("/ids")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getForIds(
            @RequestBody List<Long> ids
    ) {

        log.info("REST received to fetch departments for ids: {}",ids);

        List<DepartmentResponse> list = departmentService.getByIds(ids);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Found list of size %d", list.size()),
                list
        ));

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentResponse>> deleteDeparment(
            @PathVariable Long id
    ) {

        log.info("REST recived to delete department with ID: {}", id);

        DepartmentResponse resp = departmentService.delete(id);

        return ResponseEntity.ok(ApiResponse.success(
                "Deleted Successfully",
                resp
        ));

    }

}
