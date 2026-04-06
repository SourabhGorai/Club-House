package com.clubHouse.tnp.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {

    // CompanyMaster caches
    public static final String ALL_COMPANY_MASTERS          = "allCompanyMasters";
    public static final String COMPANY_MASTER_BY_ID         = "companyMasterById";
    public static final String COMPANY_MASTERS_BY_INDUSTRY  = "companyMastersByIndustry";

    // Industry caches
    public static final String ALL_INDUSTRIES               = "allIndustries";
    public static final String INDUSTRY_BY_ID               = "industryById";

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager(
                ALL_COMPANY_MASTERS,
                COMPANY_MASTER_BY_ID,
                COMPANY_MASTERS_BY_INDUSTRY,
                ALL_INDUSTRIES,
                INDUSTRY_BY_ID
        );
    }
}