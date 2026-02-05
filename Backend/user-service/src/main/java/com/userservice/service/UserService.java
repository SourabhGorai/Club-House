package com.userservice.service;

import com.userservice.client.ClubServiceClient;
import com.userservice.client.ProfileManagementServiceClient;
import com.userservice.dto.UserCreateDto;
import com.userservice.dto.UserDto;
import com.userservice.dto.UserUpdateDto;
import com.userservice.model.Role;
import com.userservice.model.User;
import com.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper mapper;
    private final OtpService otpService;
    private final ProfileManagementServiceClient profileManagementServiceClient;
    private final ClubServiceClient clubServiceClient;

    public UserDto registerUser(UserCreateDto dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("Username already taken");
        }
        if (dto.getEmail() == null) {
            throw new RuntimeException("Email is required for verification");
        }

        User user = mapper.toEntity(dto);
        if (user.getRole() == null) {
            user.setRole(Role.USERS);
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setVerified(false);
        User saved = userRepository.save(user);

        // generate OTP and send email (registration verification)
        otpService.generateAndSendOtpForUser(saved);

        return mapper.toDto(saved);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    public UserDto getUserByPrn(String prn) {
        return userRepository.findByPrn(prn)
                .map(mapper::toDto)
                .orElse(null);
    }

    public UserDto updateUser(String prn, UserUpdateDto dto) {
        User user = userRepository.findByPrn(prn)
                .orElseThrow(() -> new RuntimeException("User not found"));
        mapper.updateEntityFromDto(dto, user);
        if (dto.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        User saved = userRepository.save(user);
        return mapper.toDto(saved);
    }

    /**
     * Delete user with cascading deletion across services
     * NOTE: @Transactional only controls the local database transaction.
     * External service calls (WebClient) are NOT part of the transaction.
     * If external calls fail, local DB changes will still rollback due to exception propagation.
     */
    @Transactional
    public void deleteUser(String prn) {
        log.info("Starting deletion process for user with PRN: {}", prn);

        // Verify user exists first
        User user = userRepository.findByPrn(prn)
                .orElseThrow(() -> new RuntimeException("User not found with PRN: " + prn));

        // Step 1: Delete from club service (skip if user not in any clubs)
        log.info("Step 1/3: Deleting user {} from club service", prn);
        try {
            clubServiceClient.permanentlyDeleteUserFromClubService(prn);
        } catch (RuntimeException e) {
            // If it's a 404, that's fine - user wasn't in any clubs
            if (e.getMessage().contains("404") || e.getMessage().contains("Not Found")) {
                log.info("User {} was not in any clubs", prn);
            } else {
                throw e; // Re-throw other errors
            }
        }

        // Step 2: Delete from profile service
        log.info("Step 2/3: Deleting profile for user {}", prn);
        profileManagementServiceClient.permanentlyDeleteProfile(prn);

        // Step 3: Delete from user service
        log.info("Step 3/3: Deleting user {} from user database", prn);
        userRepository.delete(user);

        log.info("Successfully completed deletion of user with PRN: {}", prn);
    }

    /**
     * Validate credentials (used by validate-credentials endpoint)
     * Returns true if username/password are valid and user is verified.
     */
    public boolean validateCredentials(String username, String rawPassword) {
        return userRepository.findByUsername(username)
                .map(u -> u.isVerified() && passwordEncoder.matches(rawPassword, u.getPassword()))
                .orElse(false);
    }

    public UserDto findByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(mapper::toDto)
                .orElse(null);
    }

    public boolean validate(String prn) {
        return userRepository.existsByPrn(prn);
    }
}