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
 * - FACULTY: Faculty members
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

                // ==================== SPRINGDOC API-DOCS PROXY ROUTES ====================

                .route("user-service-api-docs", r -> r
                        .path("/user-service/v3/api-docs")
                        .filters(f -> f.rewritePath("/user-service/v3/api-docs", "/v3/api-docs"))
                        .uri("lb://USER-SERVICE"))

                .route("profile-service-api-docs", r -> r
                        .path("/profile-management-service/v3/api-docs")
                        .filters(f -> f.rewritePath("/profile-management-service/v3/api-docs", "/v3/api-docs"))
                        .uri("lb://PROFILE-MANAGEMENT-SERVICE"))

                .route("independent-service-api-docs", r -> r
                        .path("/independent-service/v3/api-docs")
                        .filters(f -> f.rewritePath("/independent-service/v3/api-docs", "/v3/api-docs"))
                        .uri("lb://INDEPENDENT-SERVICES"))

                .route("club-service2-api-docs", r -> r
                        .path("/club-service2/v3/api-docs")
                        .filters(f -> f.rewritePath("/club-service2/v3/api-docs", "/v3/api-docs"))
                        .uri("lb://CLUB-SERVICE2"))

                .route("event-service2-api-docs", r -> r
                        .path("/event-service2/v3/api-docs")
                        .filters(f -> f.rewritePath("/event-service2/v3/api-docs", "/v3/api-docs"))
                        .uri("lb://EVENT-SERVICE2"))

                .route("notification-service2-api-docs", r -> r
                        .path("/notification-service2/v3/api-docs")
                        .filters(f -> f.rewritePath("/notification-service2/v3/api-docs", "/v3/api-docs"))
                        .uri("lb://NOTIFICATION-SERVICE2"))

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
                        .path(
                                "/api/users/",
                                "/api/users/changeRole/{prn}/{role}")
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
                                        new AuthorizationFilter.Config("USERS", "FACULTY", "SUPER_ADMIN"))))
                        .uri("lb://USER-SERVICE"))

                // ==================== PROFILE MANAGEMENT SERVICE ====================

                // Create profile - USERS and SUPER_ADMIN (USERS create their own, SUPER_ADMIN can create for others)
                .route("profile-create", r -> r
                        .path("/api/profiles/create")
                        .and()
                        .method("POST")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("USERS", "FACULTY", "SUPER_ADMIN"))))
                        .uri("lb://PROFILE-MANAGEMENT-SERVICE"))

                // Bulk operations - SUPER_ADMIN only
                .route("profile-bulk-operations", r -> r
                        .path(
                                "/api/profiles/bulkCreate",
                                "/api/profiles/batch",
                                "/api/profiles/bulk",
                                "/api/profiles/image-urls"
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
                                "/api/profiles/exists/**",
                                "/api/profiles/getDataForNotification/{prn}"
                        )
                        .and()
                        .method("GET", "POST")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("USERS", "FACULTY", "SUPER_ADMIN"))))
                        .uri("lb://PROFILE-MANAGEMENT-SERVICE"))

                // Statistics - FACULTY and SUPER_ADMIN only
                .route("profile-statistics", r -> r
                        .path("/api/profiles/statistics/**")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("FACULTY", "SUPER_ADMIN"))))
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

                // Get all profiles - FACULTY and SUPER_ADMIN
                .route("profile-get-all", r -> r
                        .path("/api/profiles")
                        .and()
                        .method("GET")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("FACULTY", "SUPER_ADMIN"))))
                        .uri("lb://PROFILE-MANAGEMENT-SERVICE"))

                // Update profile - User can modify their own, SUPER_ADMIN can modify all
                .route("profile-modify", r -> r
                        .path("/api/profiles/{prn}")
                        .and()
                        .method("PUT")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("USERS", "FACULTY", "SUPER_ADMIN"))))
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
                                        new AuthorizationFilter.Config("USERS", "FACULTY", "SUPER_ADMIN"))))
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
                                        new AuthorizationFilter.Config("USERS", "FACULTY", "SUPER_ADMIN"))))
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
                                        new AuthorizationFilter.Config("USERS", "FACULTY", "SUPER_ADMIN"))))
                        .uri("lb://CLUB-SERVICE2"))

                // ==================== USER-CLUB SERVICE ====================

                .route("user-club-write", r -> r
                        .path("/api/user-clubs/getAll",
                                "/api/user-clubs/getAll/paged",
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
                                "/api/user-clubs",
                                "/api/user-clubs/user/{prn}/club/{clubName}",
                                "/api/user-clubs/changeClubRole"
                        )

                        .and()
                        .method("GET", "POST", "DELETE")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN", "FACULTY"))))
                        .uri("lb://CLUB-SERVICE2"))

                .route("user-club-all", r -> r
                        .path(
                                "/api/user-clubs/getAllByRole/{role}",
                                "/api/user-clubs/club/**",
                                "/api/user-clubs/getMyClubs",
                                "/api/user-clubs/getAllClubRoles"

                        )
                        .and()
                        .method("GET")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN", "FACULTY", "USERS"))))
                        .uri("lb://CLUB-SERVICE2"))

                // ==================== EVENT-SERVICE ====================

                .route("event-admin", r -> r
                        .path(
                                "/api/events",
                                "/api/events/paged"
                        )
                        .and()
                        .method("GET")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN"))))
                        .uri("lb://EVENT-SERVICE2"))

                .route("event-FACULTY", r -> r
                        .path(
                                "/api/events/create",
                                "/api/events/myEvents",
                                "/api/events/myEvents/**",
                                "/api/events/getByEventCreator/{prn}",
                                "/api/events/getByEventCreator/{prn}/paged",
                                "/api/events/ratings/{rating}",
                                "/api/events/ratings/{rating}/paged",
                                "/api/events/completeEvent/{eventId}",
                                "/api/events/deleteEvent/{eventId}",
                                "/api/events/updateEvent/{eventId}",
                                "/api/events/restartEnrollment"
                        )
                        .and()
                        .method("GET", "POST", "DELETE", "PUT")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN", "FACULTY"))))
                        .uri("lb://EVENT-SERVICE2"))

                .route("event-all", r -> r
                        .path(
                                "/api/events/getById/{eventId}",
                                "/api/events/organizer/{organizer}",
                                "/api/events/organizer/{organizer}/paged",
                                "/api/events/targetData/{targetType}/{targetId}",
                                "/api/events/targetData/{targetType}/{targetId}/paged",
                                "/api/events/endEvent/{status}",
                                "/api/events/targetTypes",
                                "/api/events/endEvent/{status}/paged",
                                "/api/events/getByTargetType/{targetType}",
                                "/api/events/getByTargetType/{targetType}/paged",
                                "/api/events/enrollment/{status}/paged",
                                "/api/events/enrollment/{status}",
                                "/api/events/getEventCountForClub"
                        )
                        .and()
                        .method("GET")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN", "FACULTY", "USERS"))))
                        .uri("lb://EVENT-SERVICE2"))

                .route("enrollment-all", r -> r
                        .path(
                                "/api/enrollments/**"
                        )
                        .and()
                        .method("GET", "POST", "DELETE")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN", "FACULTY", "USERS"))))
                        .uri("lb://EVENT-SERVICE2"))

                // *********** ATTENDANCE ***********

                .route("attendance-FACULTY", r -> r
                        .path(
                                "/api/attendance/start/**",
                                "/api/attendance/qr-code/**",
                                "/api/attendance/stop/**",
                                "/api/attendance/list/**"
                        )
                        .and()
                        .method("GET", "POST")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN", "FACULTY"))))
                        .uri("lb://EVENT-SERVICE2"))

                .route("attendance-all", r -> r
                        .path(
                                "/api/attendance/mark/**",
                                "/api/attendance/my-attendance",
                                "/api/attendance/status/**"
                        )
                        .and()
                        .method("GET", "POST", "DELETE")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN", "FACULTY", "USERS"))))
                        .uri("lb://EVENT-SERVICE2"))

                // ----------------------- RATINGS -----------------------

                .route("ratings", r -> r
                        .path(
                                "/api/ratings/**"
                        )
                        .and()
                        .method("GET", "POST", "PATCH")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN", "FACULTY", "USERS"))))
                        .uri("lb://EVENT-SERVICE2"))

                // ==================== NOTIFICATION-SERVICE ====================

                .route("notification-FACULTY", r -> r
                        .path(
                                "/api/notification/admin/**"
                        )
                        .and()
                        .method("GET")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN"))))
                        .uri("lb://NOTIFICATION-SERVICE2"))

                .route("notification-FACULTY", r -> r
                        .path(
                                "/api/notification",
                                "/api/notification/paged",
                                "/api/notification/cr/**",
                                "/api/notification/trigger/{notificationId}"
                        )
                        .and()
                        .method("GET", "POST")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN", "FACULTY"))))
                        .uri("lb://NOTIFICATION-SERVICE2"))

                .route("notification-FACULTY", r -> r
                        .path(
                                "/api/notification/{notificationId}",
                                "/api/notification/{notificationId}/reactivate",
                                "/api/notification/{notificationId}/deactivate"
                        )
                        .and()
                        .method("PATCH", "DELETE")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN", "FACULTY"))))
                        .uri("lb://NOTIFICATION-SERVICE2"))

                .route("notification-all", r -> r
                        .path(
                                "/api/notification/me/**",
                                "/api/notification/me",
                                "/api/notification/{notificationId}",
                                "/api/notification/by-source/**",
                                "/api/notification/by-type/**",
                                "/api/notification/by-target/**",
                                "/api/notification/meta/**"

                        )
                        .and()
                        .method("GET")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN", "FACULTY", "USERS"))))
                        .uri("lb://NOTIFICATION-SERVICE2"))

                .route("notification-all", r -> r
                        .path(
                                "/api/notification/{notificationId}/read",
                                "/api/notification/me/read-all"

                        )
                        .and()
                        .method("PATCH" +
                                "")
                        .filters(f -> f
                                .filter(authenticationFilter.apply(new AuthenticationFilter.Config()))
                                .filter(authorizationFilter.apply(
                                        new AuthorizationFilter.Config("SUPER_ADMIN", "FACULTY", "USERS"))))
                        .uri("lb://NOTIFICATION-SERVICE2"))


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