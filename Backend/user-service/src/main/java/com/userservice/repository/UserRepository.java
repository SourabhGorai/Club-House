package com.userservice.repository;


import com.userservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByPrn(String prn);
    Optional<User> getUserByPrn(String prn);
    Optional<User> findByPrn(String prn);
    // added
    Optional<User> findByEmail(String email);

    void deleteByPrn(String prn);
}
