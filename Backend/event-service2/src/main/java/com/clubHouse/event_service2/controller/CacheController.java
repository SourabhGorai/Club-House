//package com.clubHouse.event_service2.controller;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.cache.CacheManager;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.Collection;
//import java.util.HashMap;
//import java.util.Map;
//import java.util.Objects;
//
//@Slf4j
//@RestController
//@RequiredArgsConstructor
//@RequestMapping("/api/cache")
//public class CacheController {
//
//    private final CacheManager cacheManager;
//
//    @DeleteMapping("/clear-all")
//    public ResponseEntity<Map<String, String>> clearAllCaches() {
//        log.info("Request received to clear all caches");
//
//        Collection<String> cacheNames = cacheManager.getCacheNames();
//        cacheNames.forEach(cacheName -> {
//            Objects.requireNonNull(cacheManager.getCache(cacheName)).clear();
//            log.info("Cleared cache: {}", cacheName);
//        });
//
//        Map<String, String> response = new HashMap<>();
//        response.put("message", "All caches cleared successfully");
//        response.put("caches_cleared", String.join(", ", cacheNames));
//
//        return ResponseEntity.ok(response);
//    }
//
//    @DeleteMapping("/clear/{cacheName}")
//    public ResponseEntity<Map<String, String>> clearCache(@PathVariable String cacheName) {
//        log.info("Request received to clear cache: {}", cacheName);
//
//        var cache = cacheManager.getCache(cacheName);
//
//        if (cache == null) {
//            Map<String, String> response = new HashMap<>();
//            response.put("error", "Cache not found: " + cacheName);
//            return ResponseEntity.notFound().build();
//        }
//
//        cache.clear();
//        log.info("Cleared cache: {}", cacheName);
//
//        Map<String, String> response = new HashMap<>();
//        response.put("message", "Cache cleared successfully");
//        response.put("cache_name", cacheName);
//
//        return ResponseEntity.ok(response);
//    }
//
//    @GetMapping("/names")
//    public ResponseEntity<Collection<String>> getCacheNames() {
//        log.info("Request received to get all cache names");
//        return ResponseEntity.ok(cacheManager.getCacheNames());
//    }
//
//    @DeleteMapping("/{cacheName}/evict/{key}")
//    public ResponseEntity<Map<String, String>> evictCacheKey(
//            @PathVariable String cacheName,
//            @PathVariable String key) {
//
//        log.info("Request received to evict key: {} from cache: {}", key, cacheName);
//
//        var cache = cacheManager.getCache(cacheName);
//
//        if (cache == null) {
//            Map<String, String> response = new HashMap<>();
//            response.put("error", "Cache not found: " + cacheName);
//            return ResponseEntity.notFound().build();
//        }
//
//        cache.evict(key);
//        log.info("Evicted key: {} from cache: {}", key, cacheName);
//
//        Map<String, String> response = new HashMap<>();
//        response.put("message", "Key evicted successfully");
//        response.put("cache_name", cacheName);
//        response.put("key", key);
//
//        return ResponseEntity.ok(response);
//    }
//
//    @GetMapping("/stats")
//    public ResponseEntity<Map<String, Object>> getCacheStats() {
//        log.info("Request received to get cache statistics");
//
//        Map<String, Object> stats = new HashMap<>();
//        Collection<String> cacheNames = cacheManager.getCacheNames();
//
//        stats.put("total_caches", cacheNames.size());
//        stats.put("cache_names", cacheNames);
//        stats.put("cache_type", "Redis");
//
//        return ResponseEntity.ok(stats);
//    }
//}