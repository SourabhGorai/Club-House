package com.notificationservice.notification_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    @LoadBalanced
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }

    @Bean
    public WebClient userServiceWebClient(WebClient.Builder builder) {
        return builder.baseUrl("http://USER-SERVICE").build();
    }

    @Bean
    public WebClient profileServiceWebClient(WebClient.Builder builder) {
        return builder.baseUrl("http://PROFILE-MANAGEMENT-SERVICE").build();
    }

    @Bean
    public WebClient clubServiceWebClient(WebClient.Builder builder) {
        return builder.baseUrl("http://CLUB-SERVICE2").build();
    }
}