package com.gateway.api_gateway.config;

import com.gateway.api_gateway.filter.AuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Gateway configuration class
 * Routes can be defined here programmatically or in application.yml
 * Currently using application.yml for route definitions
 */
@Configuration
public class GatewayConfig {

    private final AuthenticationFilter authenticationFilter;

    // Inject AuthenticationFilter
    @Autowired
    public GatewayConfig(AuthenticationFilter authenticationFilter) {
        this.authenticationFilter = authenticationFilter;
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            // User Service - Auth endpoints (public)
            .route("user-auth", r -> r
                .path("/api/auth/**")
                .uri("lb://USER-SERVICE"))

            // User Service - User management (protected)
            .route("user-management", r -> r
                .path("/api/users/**")
                .filters(f -> f.filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                .uri("lb://USER-SERVICE"))

            .build();
    }
}