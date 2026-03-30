//package com.clubHouse.tnp.config;
//
//import org.springframework.cache.annotation.EnableCaching;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.data.redis.cache.RedisCacheConfiguration;
//import org.springframework.data.redis.cache.RedisCacheManager;
//import org.springframework.data.redis.connection.RedisConnectionFactory;
//import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;
//import org.springframework.data.redis.serializer.RedisSerializationContext;
//import org.springframework.data.redis.serializer.RedisSerializer;
//import tools.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
//
//import java.time.Duration;
//import java.util.HashMap;
//import java.util.Map;
//
//@Configuration
//@EnableCaching
//public class RedisConfig {
//
//    @Bean
//    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
//
//        BasicPolymorphicTypeValidator typeValidator =
//                BasicPolymorphicTypeValidator.builder()
//                        .allowIfBaseType(Object.class)
//                        .build();
//
//        GenericJacksonJsonRedisSerializer serializer =
//                GenericJacksonJsonRedisSerializer.builder()
//                        .enableDefaultTyping(typeValidator)
//                        .enableSpringCacheNullValueSupport()
//                        .build();
//
//        RedisCacheConfiguration defaults = RedisCacheConfiguration.defaultCacheConfig()
//                .disableCachingNullValues()
//                .serializeKeysWith(
//                        RedisSerializationContext.SerializationPair
//                                .fromSerializer(RedisSerializer.string())
//                )
//                .serializeValuesWith(
//                        RedisSerializationContext.SerializationPair
//                                .fromSerializer(serializer)
//                );
//
//        Map<String, RedisCacheConfiguration> configs = new HashMap<>();
//        configs.put("companies",      defaults.entryTtl(Duration.ofMinutes(5)));
//        configs.put("companyMasters", defaults.entryTtl(Duration.ofMinutes(30)));
//        configs.put("industries",     defaults.entryTtl(Duration.ofMinutes(30)));
//        configs.put("visitYears",     defaults.entryTtl(Duration.ofMinutes(60)));
//        configs.put("placements",     defaults.entryTtl(Duration.ofMinutes(5)));
//        configs.put("companyStats",   defaults.entryTtl(Duration.ofMinutes(15)));
//
//        return RedisCacheManager.builder(factory)
//                .cacheDefaults(defaults.entryTtl(Duration.ofMinutes(10)))
//                .withInitialCacheConfigurations(configs)
//                .build();
//    }
//}