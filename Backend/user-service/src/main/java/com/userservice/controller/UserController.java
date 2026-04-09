package com.userservice.controller;


import com.userservice.dto.ApiResponse;
import com.userservice.dto.UserDto;
import com.userservice.dto.UserUpdateDto;
import com.userservice.model.Role;
import com.userservice.security.JwtUtil;
import com.userservice.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.NotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", users));
    }

    @GetMapping("/{prn}")
    public ResponseEntity<ApiResponse<UserDto>> getUser(@PathVariable String prn) {
        UserDto dto = userService.getUserByPrn(prn);

        if (dto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("User not found with PRN: " + prn, "USER_NOT_FOUND"));
        }

        return ResponseEntity.ok(ApiResponse.success("User fetched successfully", dto));
    }

    @PutMapping("/{prn}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable String prn,
            @RequestBody UserUpdateDto dto) {
        try {
            UserDto updated = userService.updateUser(prn, dto);
            return ResponseEntity.ok(ApiResponse.success("User updated successfully", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("User not found with PRN: " + prn, "USER_NOT_FOUND"));
        }
    }

    @Transactional
    @DeleteMapping("/{prn}")
    public ResponseEntity<ApiResponse<Void>> permanentlyDeleteUser(@PathVariable String prn) {
        try {
            userService.deleteUser(prn);
            return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("User not found with PRN: " + prn, "USER_NOT_FOUND"));
        }
    }

    @GetMapping("/validate/{prn}")
    public ResponseEntity<ApiResponse<Boolean>> validateUser(@PathVariable String prn) {
        try {
            boolean valid = userService.validate(prn);
            return ResponseEntity.ok(ApiResponse.success(
                    "User validation result", valid));
        } catch (NotFoundException e) {
            log.info("User with PRN {} does not exist", prn);
            return ResponseEntity.ok(ApiResponse.success(
                    "User not found", false));
        }
    }

    @PutMapping("/changeRole/{prn}/{role}")
    public ResponseEntity<ApiResponse<UserDto>> changeRole(
            @PathVariable String prn,
            @PathVariable Role role
    ) {
        log.debug("Request received to change role of prn {}", prn);
        UserDto updated = userService.changeRole(prn, role);
        return ResponseEntity.ok(ApiResponse.success(
                "Role updated successfully", updated));
    }

    @PutMapping("/changeEmail/{prn}/{email}")
    public ResponseEntity<ApiResponse<UserDto>> changeEmail(
            @PathVariable String prn,
            @PathVariable String email
    ) {
        log.info("Request received to change email for prn: {}", prn);
        UserDto updated = userService.changeEmail(prn, email);
        return ResponseEntity.ok(ApiResponse.success("Email updated successfully", updated));
    }

    @PatchMapping("/markProfileCompletedTrue/{prn}")
    public ResponseEntity<ApiResponse<Boolean>> markCompleteProfile(
            @PathVariable String prn
    ) {
        log.debug("Request received to mark profileCompleted status true for prn: {}", prn);
        Boolean result = userService.markProfileComplete(prn);
        return ResponseEntity.ok(ApiResponse.success("Profile marked as complete", result));
    }
}