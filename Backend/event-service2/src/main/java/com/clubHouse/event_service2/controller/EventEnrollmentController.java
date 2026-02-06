package com.clubHouse.event_service2.controller;

import com.clubHouse.event_service2.dto.ApiResponse;
import com.clubHouse.event_service2.service.EventEnrollmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/enrollment")
public class EventEnrollmentController {

    private final EventEnrollmentService enrollmentService;


}
