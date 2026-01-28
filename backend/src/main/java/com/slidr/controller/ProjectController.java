package com.slidr.controller;

import com.slidr.model.Project;
import com.slidr.model.User;
import com.slidr.repository.ProjectRepository;
import com.slidr.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"})
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    // ==========================================
    // GET - Récupérer tous les projets d'un utilisateur
    // ==========================================
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getProjectsByUser(@PathVariable Long userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body("Utilisateur non trouvé");
        }
        List<Project> projects = projectRepository.findByUser(user.get());
        return ResponseEntity.ok(projects);
    }

    // ==========================================
    // GET - Récupérer un projet par son ID
    // ==========================================
    @GetMapping("/{id}")
    public ResponseEntity<?> getProject(@PathVariable Long id) {
        Optional<Project> project = projectRepository.findById(id);
        if (project.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(project.get());
    }

    // ==========================================
    // POST - Créer un nouveau projet
    // ==========================================
    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        String title = (String) request.get("title");
        String content = (String) request.get("content");

        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body("Utilisateur non trouvé");
        }

        Project project = new Project();
        project.setTitle(title);
        project.setContent(content);
        project.setUser(user.get());

        Project saved = projectRepository.save(project);
        return ResponseEntity.ok(saved);
    }

    // ==========================================
    // PUT - Mettre à jour un projet existant
    // ==========================================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Optional<Project> existingProject = projectRepository.findById(id);
        if (existingProject.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Project project = existingProject.get();
        
        if (request.containsKey("title")) {
            project.setTitle((String) request.get("title"));
        }
        if (request.containsKey("content")) {
            project.setContent((String) request.get("content"));
        }

        Project saved = projectRepository.save(project);
        return ResponseEntity.ok(saved);
    }

    // ==========================================
    // DELETE - Supprimer un projet
    // ==========================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        Optional<Project> project = projectRepository.findById(id);
        if (project.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        projectRepository.delete(project.get());
        return ResponseEntity.ok("Projet supprimé");
    }
}
