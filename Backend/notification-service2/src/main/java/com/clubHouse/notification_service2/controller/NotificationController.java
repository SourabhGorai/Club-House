package com.clubHouse.notification_service2.controller;

import com.clubHouse.notification_service2.dto.ApiResponse;
import com.clubHouse.notification_service2.dto.request.NotificationRequest;
import com.clubHouse.notification_service2.dto.response.NotificationResponse;
import com.clubHouse.notification_service2.service.JwtService;
import com.clubHouse.notification_service2.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notification")
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtService jwtService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<NotificationResponse>> createNotification(
            @RequestBody NotificationRequest req,
            HttpServletRequest httpRequest
    ) {
        log.info("Request received to create a new notification");

        String prn = jwtService.extractPrnFromHeaders(httpRequest);
        String role = jwtService.extractRoleFromHeaders(httpRequest);
        NotificationResponse resp = notificationService.createNotification(req, prn, role);

        return ResponseEntity.ok(ApiResponse.success(
                "Successfully created notification",
                resp
        ));
    }

    @GetMapping("/getAll/{status}")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getAllActive(
            @PathVariable boolean status
    ) {
        // status -> activity status

        log.info("Request received to fetch all active notifications");
        List<NotificationResponse> resp = notificationService.getAll(status);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d notifications", resp.size()),
                resp
        ));

    }

    @GetMapping("/notificationTypes")
    public ResponseEntity<ApiResponse<List<String>>> getAllNotificationTargets(){

        log.info("Request received to fetch all the notification targets");
        List<String> resp = notificationService.fetchNotificationTargets();
        return ResponseEntity.ok(ApiResponse.success(
                "Fetched successfully",
                resp
        ));
    }

    @GetMapping("/sourceTypes")
    public ResponseEntity<ApiResponse<List<String>>> getSourceTypes(){

        log.info("Request received to fetch all the Source Types");
        List<String> resp = notificationService.fetchSourceTypes();
        return ResponseEntity.ok(ApiResponse.success(
                "Fetched successfully",
                resp
        ));
    }

    @GetMapping("/TargetTypes")
    public ResponseEntity<ApiResponse<List<String>>> getTargetTypes(){

        log.info("Request received to fetch all the Target Types");
        List<String> resp = notificationService.fetchTargetTypes();
        return ResponseEntity.ok(ApiResponse.success(
                "Fetched successfully",
                resp
        ));
    }

}
