package com.clubHouse.tnp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class TnpApplication {

	public static void main(String[] args) {
		SpringApplication.run(TnpApplication.class, args);
	}

}
