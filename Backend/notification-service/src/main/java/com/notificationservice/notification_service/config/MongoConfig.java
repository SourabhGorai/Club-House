package com.notificationservice.notification_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import com.notificationservice.notification_service.model.NotificationPriority;
import com.notificationservice.notification_service.model.NotificationStatus;
import com.notificationservice.notification_service.model.NotificationType;

import java.util.Arrays;
import java.util.List;

/**
 * MongoDB Configuration with Safe Enum Converters
 *
 * NOTE: These converters include validation to prevent conversion errors
 * when Spring Data tries to convert non-enum strings.
 */
@Configuration
@EnableMongoAuditing
public class MongoConfig {

    @Bean
    public MongoCustomConversions customConversions() {
        return new MongoCustomConversions(Arrays.asList(
                new NotificationTypeReadConverter(),
                new NotificationTypeWriteConverter(),
                new NotificationStatusReadConverter(),
                new NotificationStatusWriteConverter(),
                new NotificationPriorityReadConverter(),
                new NotificationPriorityWriteConverter()
        ));
    }

    // NotificationType Converters with validation
    static class NotificationTypeReadConverter implements Converter<String, NotificationType> {
        @Override
        public NotificationType convert(String source) {
            if (source == null || source.isEmpty()) {
                return null;
            }
            // Only convert if it's a valid enum constant
            try {
                return NotificationType.valueOf(source);
            } catch (IllegalArgumentException e) {
                // Not a valid enum constant, return null or throw exception
                // Returning null allows Spring to skip this converter
                return null;
            }
        }
    }

    static class NotificationTypeWriteConverter implements Converter<NotificationType, String> {
        @Override
        public String convert(NotificationType source) {
            return source != null ? source.name() : null;
        }
    }

    // NotificationStatus Converters with validation
    static class NotificationStatusReadConverter implements Converter<String, NotificationStatus> {
        @Override
        public NotificationStatus convert(String source) {
            if (source == null || source.isEmpty()) {
                return null;
            }
            try {
                return NotificationStatus.valueOf(source);
            } catch (IllegalArgumentException e) {
                return null;
            }
        }
    }

    static class NotificationStatusWriteConverter implements Converter<NotificationStatus, String> {
        @Override
        public String convert(NotificationStatus source) {
            return source != null ? source.name() : null;
        }
    }

    // NotificationPriority Converters with validation
    static class NotificationPriorityReadConverter implements Converter<String, NotificationPriority> {
        @Override
        public NotificationPriority convert(String source) {
            if (source == null || source.isEmpty()) {
                return null;
            }
            try {
                return NotificationPriority.valueOf(source);
            } catch (IllegalArgumentException e) {
                return null;
            }
        }
    }

    static class NotificationPriorityWriteConverter implements Converter<NotificationPriority, String> {
        @Override
        public String convert(NotificationPriority source) {
            return source != null ? source.name() : null;
        }
    }
}