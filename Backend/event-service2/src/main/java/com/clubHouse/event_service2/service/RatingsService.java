package com.clubHouse.event_service2.service;

import com.clubHouse.event_service2.repository.EventRepository;
import com.clubHouse.event_service2.repository.RatingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RatingsService {

    private final RatingsRepository ratingsRepository;
    private final EventRepository eventRepository;



}
