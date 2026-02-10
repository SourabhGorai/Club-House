package com.gateway.api_gateway.config;

import com.gateway.api_gateway.filter.AuthenticationFilter;
import com.gateway.api_gateway.filter.AuthorizationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Gateway Configuration with Role-Based Authorization
 * <p>
 * Available Roles:
 * - USERS: Regular students
 * - TEACHERS: Faculty members
 * - SUPER_ADMIN: System administrators
 */
@Configuration
public class GatewayConfig {

    private final AuthenticationFilter authenticationFilter;
    private final AuthorizationFilter authorizationFilter;

    @Autowired
    public GatewayConfig(AuthenticationFilter authenticationFilter,
                         AuthorizationFilter authorizationFilter) {
        this.authenticationFilter = authenticationFilter;
        this.authorizationFilter = authorizationFilter;
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()

                // ==================== USER SERVICE ====================

                // Public auth endpoints (no authentication required)
                .route("user-auth-public", r -> r
                        .path(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/verify-otp",
                                "/api/auth/resend-verify-otp",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password",
                                "/api/auth/validate-credentials"
                        )
                        .uri("lb://USER-SERVICE"))

                // Bulk operations - SUPER_ADMIN only
                .route("user-auth-admin", r -> r
                        .path(
                                "/api/auth/bulk-register",
                                "/api/auth/bulk-verify-otp"
                        )
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN"))))
                        .uri("lb://USER-SERVICE"))

                // Token validation - all authenticated users
                .route("user-auth-validate-token", r -> r
                        .path("/api/auth/validate-token")
                        .filters(f -> f.filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://USER-SERVICE"))

                // Get all users - SUPER_ADMIN only
                .route("user-get-all", r -> r
                        .path("/api/users/")
                        .and()
                        .method("GET")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN"))))
                        .uri("lb://USER-SERVICE"))

                // User validation endpoint - internal use (all authenticated)
                .route("user-validate", r -> r
                        .path("/api/users/validate/**")
                        .filters(f -> f.filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://USER-SERVICE"))

                // Get/Update/Delete specific user - User can access their own, SUPER_ADMIN can access all
                .route("user-management", r -> r
                        .path("/api/users/**")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("USERS", "TEACHERS", "SUPER_ADMIN"))))
                        .uri("lb://USER-SERVICE"))

                // ==================== PROFILE MANAGEMENT SERVICE ====================

                // Create profile - USERS and SUPER_ADMIN (USERS create their own, SUPER_ADMIN can create for others)
                .route("profile-create", r -> r
                        .path("/api/profiles")
                        .and()
                        .method("POST")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("USERS", "TEACHERS", "SUPER_ADMIN"))))
                        .uri("lb://PROFILE-MANAGEMENT-SERVICE"))

                // Bulk operations - SUPER_ADMIN only
                .route("profile-bulk-operations", r -> r
                        .path(
                                "/api/profiles/bulkCreate",
                                "/api/profiles/batch",
                                "/api/profiles/bulk"
                        )
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN"))))
                        .uri("lb://PROFILE-MANAGEMENT-SERVICE"))

                // Public profile endpoints - all authenticated users can view
                .route("profile-public-read", r -> r
                        .path(
                                "/api/profiles/public/**",
                                "/api/profiles/summary/**",
                                "/api/profiles/prn/**",
                                "/api/profiles/prns",
                                "/api/profiles/department/**",
                                "/api/profiles/year/**",
                                "/api/profiles/filter",
                                "/api/profiles/paged",
                                "/api/profiles/search",
                                "/api/profiles/exists/**"
                        )
                        .and()
                        .method("GET", "POST")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("USERS", "TEACHERS", "SUPER_ADMIN"))))
                        .uri("lb://PROFILE-MANAGEMENT-SERVICE"))

                // Statistics - TEACHERS and SUPER_ADMIN only
                .route("profile-statistics", r -> r
                        .path("/api/profiles/statistics/**")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("TEACHERS", "SUPER_ADMIN"))))
                        .uri("lb://PROFILE-MANAGEMENT-SERVICE"))

                // Administrative operations - SUPER_ADMIN only
                .route("profile-admin", r -> r
                        .path(
                                "/api/profiles/permanentDelete/**"
//                                "/api/profiles/expiredProfiles"
//                                "/api/profiles/markAsCleanedUp",
//                                "/api/profiles/filter/prns"
                        )
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN"))))
                        .uri("lb://PROFILE-MANAGEMENT-SERVICE"))

                // Get all profiles - TEACHERS and SUPER_ADMIN
                .route("profile-get-all", r -> r
                        .path("/api/profiles")
                        .and()
                        .method("GET")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("TEACHERS", "SUPER_ADMIN"))))
                        .uri("lb://PROFILE-MANAGEMENT-SERVICE"))

                // Update profile - User can modify their own, SUPER_ADMIN can modify all
                .route("profile-modify", r -> r
                        .path("/api/profiles/{prn}")
                        .and()
                        .method("PUT")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("USERS", "TEACHERS", "SUPER_ADMIN"))))
                        .uri("lb://PROFILE-MANAGEMENT-SERVICE"))

                .route("profile-modify", r -> r
                        .path("/api/profiles/{prn}")
                        .and()
                        .method("DELETE")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN"))))
                        .uri("lb://PROFILE-MANAGEMENT-SERVICE"))

                // Image operations - User can manage their own images, SUPER_ADMIN can manage all
                .route("profile-images", r -> r
                        .path("/api/profiles/*/image/**")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("USERS", "TEACHERS", "SUPER_ADMIN"))))
                        .uri("lb://PROFILE-MANAGEMENT-SERVICE"))

                // Validation endpoint - all authenticated
                .route("profile-validate", r -> r
                        .path("/api/profiles/validate")
                        .filters(f -> f.filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://PROFILE-MANAGEMENT-SERVICE"))

                // Health check - public
                .route("profile-health", r -> r
                        .path("/api/profiles/health")
                        .uri("lb://PROFILE-MANAGEMENT-SERVICE"))

                // ==================== DEPARTMENT SERVICE ====================

                // View departments - all authenticated users
                .route("department-read", r -> r
                        .path("/api/department", "/api/department/{id}", "/api/department/ids")
                        .and()
                        .method("GET", "POST")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("USERS", "TEACHERS", "SUPER_ADMIN"))))
                        .uri("lb://INDEPENDENT-SERVICES"))

                // Create/Delete departments - SUPER_ADMIN only
                .route("department-admin", r -> r
                        .path("/api/department/**")
                        .and()
                        .method("POST", "DELETE")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN"))))
                        .uri("lb://INDEPENDENT-SERVICES"))

                // ==================== CLUB SERVICE ====================

                // View departments - all authenticated users
                .route("club-create", r -> r
                        .path("/api/clubs")
                        .and()
                        .method("DELETE", "POST")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN"))))
                        .uri("lb://CLUB-SERVICE2"))

                .route("clubs-read", r -> r
                        .path("/api/clubs", "/api/clubs/**")
                        .and()
                        .method("GET")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("USERS", "TEACHERS", "SUPER_ADMIN"))))
                        .uri("lb://CLUB-SERVICE2"))

                // ==================== USER-CLUB SERVICE ====================

                .route("user-club-write", r -> r
                        .path("/api/user-clubs/getAll",
                                "/api/user-clubs/bulk",
                                "/api/user-clubs/permanentlyDelete/{prn}")
                        .and()
                        .method("POST", "GET", "DELETE")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN"))))
                        .uri("lb://CLUB-SERVICE2"))

                .route("user-club-teacher", r -> r
                        .path("/api/user-clubs/user/**",
                                "/api/user-clubs")
                        .and()
                        .method("GET", "POST")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN", "TEACHERS"))))
                        .uri("lb://CLUB-SERVICE2"))

                .route("user-club-all", r -> r
                        .path(
                                "/api/user-clubs/getAllByRole/{role}",
                                "/api/user-clubs/club/**"

                        )
                        .and()
                        .method("GET")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN", "TEACHERS", "USERS"))))
                        .uri("lb://CLUB-SERVICE2"))

                .build();
    }
}

//package com.gateway.api_gateway.config;
//
//import com.gateway.api_gateway.filter.AuthenticationFilter;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.cloud.gateway.route.RouteLocator;
//import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
/// **
// * Gateway configuration class
// * Routes can be defined here programmatically or in application.yml
// * Currently using application.yml for route definitions
// */
//@Configuration
//public class GatewayConfig {
//
//    private final AuthenticationFilter authenticationFilter;
//
//    // Inject AuthenticationFilter
//    @Autowired
//    public GatewayConfig(AuthenticationFilter authenticationFilter) {
//        this.authenticationFilter = authenticationFilter;
//    }
//
//    @Bean
//    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
//        return builder.routes()
//            // User Service - Auth endpoints (public)
//            .route("user-auth", r -> r
//                .path("/api/auth/**")
//                .uri("lb://USER-SERVICE"))
//
//            // User Service - User management (protected)
//            .route("user-management", r -> r
//                .path("/api/users/**")
//                .filters(f -> f.filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
//                .uri("lb://USER-SERVICE"))
//
//            .build();
//    }
//}