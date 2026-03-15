package com.clubHouse.event_service2.controller;

import com.clubHouse.event_service2.service.RatingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ratings")
public class RatingsController {

    private final RatingsService ratingsService;



}
