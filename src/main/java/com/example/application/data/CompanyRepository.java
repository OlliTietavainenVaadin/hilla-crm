package com.example.application.data;


import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CompanyRepository
        extends JpaRepository<Company, Long>, JpaSpecificationExecutor<Company> {

    @Query("Select c from Company c where c.parnt is null")
    List<Company> findAllParentCompanies();

    @Query("Select c from Company c where c.parnt.id = ?1")
    List<Company> findAllChildCompanies(long parntId);
}
