package com.clubHouse.tnp.repository;

import com.clubHouse.tnp.model.CompanyMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Set;

public interface CompanyMasterRepository extends JpaRepository<CompanyMaster, Long> {
    CompanyMaster findByName(String sanitizedName);

    List<CompanyMaster> findByNameIn(Collection<String> names);
}
