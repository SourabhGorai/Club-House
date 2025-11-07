package com.user_service.user_service.service;

import com.user_service.user_service.dto.UserCreateDto;
import com.user_service.user_service.dto.UserDto;
import com.user_service.user_service.dto.UserUpdateDto;
import com.user_service.user_service.model.Role;
import com.user_service.user_service.model.User;
import com.user_service.user_service.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper mapper;
    private final OtpService otpService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       UserMapper mapper,
                       OtpService otpService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mapper = mapper;
        this.otpService = otpService;
    }

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
        return userRepository.findAll().stream().map(mapper::toDto).collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        return userRepository.findById(id).map(mapper::toDto).orElse(null);
    }

    public UserDto updateUser(Long id, UserUpdateDto dto) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        mapper.updateEntityFromDto(dto, user);
        if (dto.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        User saved = userRepository.save(user);
        return mapper.toDto(saved);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) throw new RuntimeException("User not found");
        userRepository.deleteById(id);
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
        return userRepository.findByUsername(username).map(mapper::toDto).orElse(null);
    }
}
