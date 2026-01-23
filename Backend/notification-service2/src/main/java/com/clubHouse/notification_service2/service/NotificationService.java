package com.clubHouse.notification_service2.service;

import com.clubHouse.notification_service2.repository.NotificationRepository;
import com.netflix.discovery.provider.Serializer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

}
