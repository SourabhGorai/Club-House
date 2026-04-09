package com.userservice.controller;


import com.userservice.dto.*;
import com.userservice.security.JwtUtil;
import com.userservice.service.CustomUserDetailsService;
import com.userservice.service.OtpService;
import com.userservice.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final UserService userService;
    private final OtpService otpService;

    public AuthController(AuthenticationManager authManager, JwtUtil jwtUtil,
                          CustomUserDetailsService userDetailsService, UserService userService,
                          OtpService otpService) {
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.userService = userService;
        this.otpService = otpService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> register(
            @Validated @RequestBody UserCreateDto dto
    ) {
        UserDto created = userService.registerUser(dto);
        return ResponseEntity.ok(ApiResponse.success(
                "User registered successfully. OTP sent to email.",
                created
        ));
    }

    @PostMapping("/bulk-register")
    public ResponseEntity<ApiResponse<BulkOperationResultDto>> bulkRegister(
            @Validated @RequestBody BulkRegisterRequestDto request
    ) {

        int successCount = 0;
        int failureCount = 0;
        List<Map<String, Object>> results = new ArrayList<>();

        for (UserCreateDto dto : request.getUsers()) {
            try {
                userService.registerUser(dto);
                successCount++;
                results.add(Map.of(
                        "username", dto.getUsername(),
                        "status", "SUCCESS",
                        "message", "User created. OTP sent to email."
                ));
            } catch (Exception e) {
                failureCount++;
                results.add(Map.of(
                        "username", dto.getUsername(),
                        "status", "FAILED",
                        "message", e.getMessage()
                ));
            }
        }

        BulkOperationResultDto result = new BulkOperationResultDto(
                request.getUsers().size(), successCount, failureCount, results
        );

        String message = String.format("Bulk registration complete: %d succeeded, %d failed.",
                successCount, failureCount);

        return ResponseEntity.ok(ApiResponse.success(message, result));
    }

    @PostMapping("/createAdmin")
    public ResponseEntity<ApiResponse<UserDto>> createAdmin(
            @Validated @RequestBody UserCreateDto dto,
            HttpServletRequest req
    ) {
        String token = req.getHeader("Authorization").substring(7);
        String requesterRole = jwtUtil.extractRole(token);

        UserDto created = userService.registerAdmin(dto, requesterRole);
        return ResponseEntity.ok(ApiResponse.success(
                "Admin created successfully",
                created
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDto>> login(
            @Validated @RequestBody AuthRequestDto request
    ) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            var user = userDetailsService.loadUserByUsername(request.getUsername());
            var userDto = userService.findByUsername(user.getUsername());

            if (userDto == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not found", "USER_NOT_FOUND"));
            }

            if (!userDto.isVerified()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Email not verified. Please verify your OTP.", "EMAIL_NOT_VERIFIED"));
            }

            String role = user.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
            String token = jwtUtil.generateToken(user.getUsername(), role, userDto.getPrn());

            AuthResponseDto authResponse = AuthResponseDto.builder()
                    .token(token)
                    .user(userDto)
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));

        } catch (AuthenticationException e) {
            throw new BadCredentialsException("Invalid credentials");
        }
    }

    @PostMapping("/validate-credentials")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> validateCredentials(
            @RequestBody AuthRequestDto dto
    ) {
        boolean ok = userService.validateCredentials(dto.getUsername(), dto.getPassword());
        return ResponseEntity.ok(ApiResponse.success("Credentials validated", Map.of("valid", ok)));
    }

    @GetMapping("/validate-token")
    public ResponseEntity<ApiResponse<UserDto>> validateToken(
            @RequestHeader("Authorization") String authHeader
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Missing or malformed Authorization header", "INVALID_HEADER"));
        }

        String token = authHeader.substring(7);

        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Token is invalid or expired", "INVALID_TOKEN"));
        }

        String username = jwtUtil.extractUsername(token);
        UserDto dto = userService.findByUsername(username);

        if (dto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("User not found", "USER_NOT_FOUND"));
        }

        return ResponseEntity.ok(ApiResponse.success("Token is valid", dto));
    }

    // ==== OTP endpoints ====

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyRegistrationOtp(
            @RequestBody Map<String, String> body
    ) {
        String email = body.get("email");
        String otp = body.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("email and otp are required", "MISSING_FIELDS"));
        }

        boolean ok = otpService.verifyOtpForEmail(email, otp);

        if (ok) {
            return ResponseEntity.ok(ApiResponse.success("Email verified successfully"));
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Invalid or expired OTP", "INVALID_OTP"));
    }

    @PostMapping("/bulk-verify-otp")
    public ResponseEntity<ApiResponse<BulkOperationResultDto>> bulkVerifyOtp(
            @Validated @RequestBody BulkOtpVerifyRequestDto request
    ) {

        int successCount = 0;
        int failureCount = 0;
        List<Map<String, Object>> results = new ArrayList<>();

        for (BulkOtpVerifyRequestDto.OtpItem item : request.getRequests()) {
            boolean ok = otpService.verifyOtpForEmail(item.getEmail(), item.getOtp());

            if (ok) {
                successCount++;
                results.add(Map.of("email", item.getEmail(), "status", "VERIFIED"));
            } else {
                failureCount++;
                results.add(Map.of(
                        "email", item.getEmail(),
                        "status", "FAILED",
                        "message", "Invalid or expired OTP"
                ));
            }
        }

        BulkOperationResultDto result = new BulkOperationResultDto(
                request.getRequests().size(), successCount, failureCount, results
        );

        String message = String.format("Bulk OTP verification complete: %d verified, %d failed.",
                successCount, failureCount);

        return ResponseEntity.ok(ApiResponse.success(message, result));
    }

    @PostMapping("/resend-verify-otp")
    public ResponseEntity<ApiResponse<Void>> resendVerificationOtp(
            @RequestBody Map<String, String> body
    ) {
        String email = body.get("email");

        if (email == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("email is required", "MISSING_FIELDS"));
        }

        otpService.generateAndSendOtpForEmail(email);
        return ResponseEntity.ok(ApiResponse.success("OTP resent successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @RequestBody Map<String, String> body
    ) {
        String email = body.get("email");

        if (email == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("email is required", "MISSING_FIELDS"));
        }

        otpService.generateAndSendOtpForEmail(email);
        return ResponseEntity.ok(ApiResponse.success("OTP sent for password reset"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @RequestBody Map<String, String> body
    ) {
        String email = body.get("email");
        String otp = body.get("otp");
        String newPassword = body.get("newPassword");

        if (email == null || otp == null || newPassword == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("email, otp and newPassword are required", "MISSING_FIELDS"));
        }

        boolean ok = otpService.verifyOtpAndResetPassword(email, otp, newPassword);

        if (ok) {
            return ResponseEntity.ok(ApiResponse.success("Password reset successful"));
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Invalid or expired OTP", "INVALID_OTP"));
    }
}