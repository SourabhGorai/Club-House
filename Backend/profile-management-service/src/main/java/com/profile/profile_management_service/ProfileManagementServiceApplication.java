package com.profile.profile_management_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ProfileManagementServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProfileManagementServiceApplication.class, args);
	}

}
