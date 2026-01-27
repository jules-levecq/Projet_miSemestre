package com.slidr.repository;

import com.slidr.model.Project;
import com.slidr.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    // Permet de récupérer tous les diaporamas d'un utilisateur spécifique
    List<Project> findByUser(User user);
}