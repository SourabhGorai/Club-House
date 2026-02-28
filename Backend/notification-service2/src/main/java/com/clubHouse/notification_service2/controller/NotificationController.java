package com.clubHouse.notification_service2.controller;

import com.clubHouse.notification_service2.dto.ApiResponse;
import com.clubHouse.notification_service2.dto.request.NotificationRequest;
import com.clubHouse.notification_service2.dto.response.NotificationResponse;
import com.clubHouse.notification_service2.model.NotificationType;
import com.clubHouse.notification_service2.model.SourceType;
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

    @GetMapping("/data/notificationTypes")
    public ResponseEntity<ApiResponse<List<String>>> getAllNotificationTargets(){

        log.info("Request received to fetch all the notification targets");
        List<String> resp = notificationService.fetchNotificationTargets();
        return ResponseEntity.ok(ApiResponse.success(
                "Fetched successfully",
                resp
        ));
    }

    @GetMapping("/data/sourceTypes")
    public ResponseEntity<ApiResponse<List<String>>> getSourceTypes(){

        log.info("Request received to fetch all the Source Types");
        List<String> resp = notificationService.fetchSourceTypes();
        return ResponseEntity.ok(ApiResponse.success(
                "Fetched successfully",
                resp
        ));
    }

    @GetMapping("/data/targetTypes")
    public ResponseEntity<ApiResponse<List<String>>> getTargetTypes(){

        log.info("Request received to fetch all the Target Types");
        List<String> resp = notificationService.fetchTargetTypes();
        return ResponseEntity.ok(ApiResponse.success(
                "Fetched successfully",
                resp
        ));
    }

    @GetMapping("/getBySourceTypes/{sourceType}")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getBySourceType(
            @PathVariable SourceType sourceType
    ) {

        log.debug("Request received to fetch all the notification for source type: {}", sourceType);
        List<NotificationResponse> resp = notificationService.getBySourceType(sourceType);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d notifications", resp.size()),
                resp
        ));

    }

    // ──────────────────────────────────────────────────────────────────────────────────────

    @GetMapping("/getByNotificationType/{nType}")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getByNotificationType(
            @PathVariable NotificationType nType
    ) {

        log.debug("Request received to fetch all the notification with Notification Type {}",
                nType);

        List<NotificationResponse> list = notificationService.getByNotificationType(nType);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d responses", list.size()),
                list
        ));

    }

    // ──────────────────────────────────────────────────────────────────────────────────────

    @GetMapping("/getByTargetType/{targetType}")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getByTargetType(
            @PathVariable NotificationType targetType
    ) {

        log.debug("Request received to fetch all the notification with TargetType Type {}",
                targetType);

        List<NotificationResponse> list = notificationService.getByNotificationType(targetType);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Fetched %d responses", list.size()),
                list
        ));

    }

}
