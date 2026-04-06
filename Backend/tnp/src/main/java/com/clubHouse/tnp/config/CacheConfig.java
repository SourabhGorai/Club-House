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

    // TNP Member caches
    public static final String TNP_MEMBER_BY_PRN            = "tnpMemberByPrn";
    public static final String TNP_ALL_ACTIVE_MEMBERS       = "tnpAllActiveMembers";
    public static final String TNP_ALL_INACTIVE_MEMBERS     = "tnpAllInactiveMembers";
    public static final String TNP_MEMBERS_BY_ROLE          = "tnpMembersByRole";
    public static final String TNP_MEMBERS_BY_YEAR          = "tnpMembersByYear";
    public static final String TNP_ROLES                    = "tnpRoles";

    // Company caches
    public static final String ALL_COMPANIES                = "allCompanies";
    public static final String COMPANY_BY_ID                = "companyById";
    public static final String COMPANIES_BY_NAME            = "companiesByName";
    public static final String COMPANIES_BY_INDUSTRY        = "companiesByIndustry";
    public static final String COMPANIES_BY_SESSION         = "companiesBySession";
    public static final String COMPANIES_BY_PACKAGE_RANGE   = "companiesByPackageRange";
    public static final String COMPANIES_BY_MIN_HIRED       = "companiesByMinHired";
    public static final String COMBINED_PACKAGES_BY_SESSION = "combinedPackagesBySession";
    public static final String COMPANY_OVERALL_STATS        = "companyOverallStats";

    // Placement caches
    public static final String PLACEMENT_BY_ID              = "placementById";
    public static final String PLACEMENTS_BY_PRN            = "placementsByPrn";
    public static final String PLACEMENTS_BY_SESSION        = "placementsBySession";
    public static final String PLACEMENT_STATS_BY_SESSION   = "placementStatsBySession";

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager(
                ALL_COMPANY_MASTERS,
                COMPANY_MASTER_BY_ID,
                COMPANY_MASTERS_BY_INDUSTRY,
                ALL_INDUSTRIES,
                INDUSTRY_BY_ID,
                TNP_MEMBER_BY_PRN,
                TNP_ALL_ACTIVE_MEMBERS,
                TNP_ALL_INACTIVE_MEMBERS,
                TNP_MEMBERS_BY_ROLE,
                TNP_MEMBERS_BY_YEAR,
                TNP_ROLES,
                ALL_COMPANIES,
                COMPANY_BY_ID,
                COMPANIES_BY_NAME,
                COMPANIES_BY_INDUSTRY,
                COMPANIES_BY_SESSION,
                COMPANIES_BY_PACKAGE_RANGE,
                COMPANIES_BY_MIN_HIRED,
                COMBINED_PACKAGES_BY_SESSION,
                COMPANY_OVERALL_STATS,
                PLACEMENT_BY_ID,
                PLACEMENTS_BY_PRN,
                PLACEMENTS_BY_SESSION,
                PLACEMENT_STATS_BY_SESSION
        );
    }
}