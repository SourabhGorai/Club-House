package com.gateway.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();

        // ✅ Remove duplicate localhost:5173
        corsConfig.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",      // React default
                "http://localhost:4200",      // Angular default
                "http://localhost:5173"       // Vite default - ONLY ONCE
                // Removed: "http://localhost:8081" - microservices don't need CORS
        ));

        corsConfig.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        corsConfig.setAllowedHeaders(List.of("*"));

        corsConfig.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-User-Username",
                "X-User-Role",
                "X-User-Id"
        ));

        corsConfig.setAllowCredentials(true);
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}

//package com.gateway.api_gateway.config;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.reactive.CorsWebFilter;
//import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
//
//import java.util.Arrays;
//import java.util.List;
//
///**
// * CORS configuration for the API Gateway
// * This allows frontend applications to make requests to the gateway
// */
//@Configuration
//public class CorsConfig {
//
//    @Bean
//    public CorsWebFilter corsWebFilter() {
//        CorsConfiguration corsConfig = new CorsConfiguration();
//
//        // Allow specific origins (add your frontend URLs here)
//        corsConfig.setAllowedOrigins(Arrays.asList(
//                "http://localhost:3000",      // React default
//                "http://localhost:4200",      // Angular default
//                "http://localhost:5173",      // Vite default
//                "http://localhost:8081"       // Your user service (for testing)
//        ));
//
//        // For development, you can use allowedOriginPatterns
//        // corsConfig.setAllowedOriginPatterns(List.of("*"));
//
//        // Allow specific HTTP methods
//        corsConfig.setAllowedMethods(Arrays.asList(
//                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
//        ));
//
//        // Allow all headers
//        corsConfig.setAllowedHeaders(List.of("*"));
//
//        // Expose headers that the client can access
//        corsConfig.setExposedHeaders(Arrays.asList(
//                "Authorization",
//                "Content-Type",
//                "X-User-Username",
//                "X-User-Role"
//        ));
//
//        // Allow credentials (cookies, authorization headers)
//        corsConfig.setAllowCredentials(true);
//
//        // Cache preflight requests for 1 hour
//        corsConfig.setMaxAge(3600L);
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", corsConfig);
//
//        return new CorsWebFilter(source);
//    }
//}