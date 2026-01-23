package com.clubHouse.event_service2.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ServerWebExchange;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.function.Function;

@Service
@Slf4j
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    /**
     * Extract PRN from gateway headers (preferred method)
     */
    public String extractPrnFromHeaders(ServerWebExchange exchange) {
        String userId = exchange.getRequest().getHeaders().getFirst("X-User-Id");
        log.debug("Extracted PRN from headers: {}", userId);
        return userId;
    }

    /**
     * Extract username from gateway headers
     */
    public String extractUsernameFromHeaders(ServerWebExchange exchange) {
        String username = exchange.getRequest().getHeaders().getFirst("X-User-Username");
        log.debug("Extracted username from headers: {}", username);
        return username;
    }

    /**
     * Extract role from gateway headers
     */
    public String extractRoleFromHeaders(ServerWebExchange exchange) {
        String role = exchange.getRequest().getHeaders().getFirst("X-User-Role");
        log.debug("Extracted role from headers: {}", role);
        return role;
    }

    // ========== FALLBACK: Direct JWT token extraction ==========
    // Use these only if you need to validate the token again in the service

    public String extractPrn(String token) {
        // Changed from Long to String to match your User entity
        return extractClaim(token, claims -> claims.get("prn", String.class));
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }
}