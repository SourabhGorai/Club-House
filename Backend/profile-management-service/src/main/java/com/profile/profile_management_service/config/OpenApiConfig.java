package com.profile.profile_management_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI/Swagger Configuration (Optional - requires springdoc-openapi dependency)
 * Provides API documentation
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI profileManagementOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Profile Management Service API")
                        .description("REST API for College Club Management Portal - Profile Service")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Development Team")
                                .email("dev@college.com")));
    }
}