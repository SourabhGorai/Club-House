package com.clubservice2.club_service2.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {

    // Club caches
    public static final String CLUB_BY_ID = "clubById";
    public static final String CLUB_BY_NAME = "clubByName";
    public static final String ALL_CLUBS = "allClubs";
    public static final String ACTIVE_CLUBS = "activeClubs";
    public static final String PUBLIC_CLUBS = "publicClubs";
    public static final String ADMIN_RESPONSE = "adminResponse";

    // UserClub caches
    public static final String USER_CLUBS = "userClubs";
    public static final String USER_CLUB_NAMES = "userClubNames";
    public static final String CLUB_MEMBERS = "clubMembers";
    public static final String CLUB_PRNS = "clubPrns";
    public static final String CLUB_MEMBERS_BY_YEAR = "clubMembersByYear";
    public static final String ALL_USER_CLUBS = "allUserClubs";
    public static final String USERS_BY_ROLE = "usersByRole";
    public static final String MY_CLUBS = "myClubs";

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager(
                CLUB_BY_ID,
                CLUB_BY_NAME,
                ALL_CLUBS,
                ACTIVE_CLUBS,
                PUBLIC_CLUBS,
                ADMIN_RESPONSE,
                USER_CLUBS,
                USER_CLUB_NAMES,
                CLUB_MEMBERS,
                CLUB_PRNS,
                CLUB_MEMBERS_BY_YEAR,
                ALL_USER_CLUBS,
                USERS_BY_ROLE,
                MY_CLUBS
        );
    }
}