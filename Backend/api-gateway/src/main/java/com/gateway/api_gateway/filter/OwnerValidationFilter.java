package com.gateway.api_gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Owner Validation Filter - Ensures users can only access their own resources
 * This filter checks if the PRN in the URL matches the authenticated user's PRN
 * SUPER_ADMIN can access any resource
 */
@Component
@Slf4j
public class OwnerValidationFilter extends AbstractGatewayFilterFactory<OwnerValidationFilter.Config> {

    public OwnerValidationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            
            // Extract user info from headers (set by AuthenticationFilter)
            String userPrn = request.getHeaders().getFirst("X-User-Prn");
            String userRole = request.getHeaders().getFirst("X-User-Role");
            
            if (userPrn == null || userRole == null) {
                log.warn("⚠️ Missing user context in headers for owner validation");
                return onError(exchange, "Missing user context", HttpStatus.FORBIDDEN);
            }

            // SUPER_ADMIN can access any resource
            if ("SUPER_ADMIN".equalsIgnoreCase(userRole)) {
                log.debug("✅ SUPER_ADMIN bypass for owner validation on path: {}", request.getPath());
                return chain.filter(exchange);
            }

            // Extract PRN from path
            String pathPrn = extractPrnFromPath(request.getPath().toString());
            
            if (pathPrn == null) {
                log.warn("⚠️ Could not extract PRN from path: {}", request.getPath());
                // If we can't extract PRN, let it through (might be a list endpoint)
                return chain.filter(exchange);
            }

            // Check if user is accessing their own resource
            if (!userPrn.equals(pathPrn)) {
                log.warn("🚫 User '{}' attempted to access resource belonging to '{}'", 
                        userPrn, pathPrn);
                return onError(exchange, 
                        "Access denied. You can only access your own resources.", 
                        HttpStatus.FORBIDDEN);
            }

            log.debug("✅ Owner validation successful for user '{}' accessing path: {}", 
                    userPrn, request.getPath());
            return chain.filter(exchange);
        };
    }

    /**
     * Extract PRN from URL path
     * Supports patterns like:
     * - /api/profiles/PRN12345
     * - /api/profiles/prn/PRN12345
     * - /api/users/PRN12345
     */
    private String extractPrnFromPath(String path) {
        // Pattern to match PRN in path (after /api/*/prn/ or /api/*/{prn})
        Pattern pattern = Pattern.compile("/(?:prn/)?([A-Z0-9]+)(?:/|$)");
        Matcher matcher = pattern.matcher(path);
        
        if (matcher.find()) {
            String prn = matcher.group(1);
            // Basic validation - PRN should start with letters
            if (prn.matches("^[A-Z]+[0-9]+.*")) {
                return prn;
            }
        }
        
        return null;
    }

    /**
     * Handle authorization errors
     */
    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().add("Content-Type", "application/json");

        String errorResponse = String.format(
                "{\"error\": \"%s\", \"status\": %d, \"timestamp\": \"%s\", \"path\": \"%s\"}",
                message,
                status.value(),
                java.time.Instant.now().toString(),
                exchange.getRequest().getPath()
        );

        byte[] bytes = errorResponse.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return response.writeWith(Mono.just(response.bufferFactory().wrap(bytes)));
    }

    public static class Config {
        // Configuration properties can be added here if needed
        private boolean enabled = true;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }
    }
}