package com.user_service.user_service.controller;

import com.user_service.user_service.model.User;
import com.user_service.user_service.security.JwtUtil;
import com.user_service.user_service.service.CustomUserDetailsService;
import com.user_service.user_service.service.UserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final UserService userService;

    public AuthController(AuthenticationManager authManager, JwtUtil jwtUtil,
                          CustomUserDetailsService userDetailsService, UserService userService) {
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.userService = userService;
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody User request) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            var user = userDetailsService.loadUserByUsername(request.getUsername());
            String role = user.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
            String token = jwtUtil.generateToken(user.getUsername(), role);
            return Map.of("token", token);
        } catch (AuthenticationException e) {
            throw new RuntimeException("Invalid credentials");
        }
    }
}
