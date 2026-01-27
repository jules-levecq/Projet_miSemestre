package com.slidr.repository;

import com.slidr.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Cette méthode permet de chercher un utilisateur par son email
    Optional<User> findByEmail(String email);
}