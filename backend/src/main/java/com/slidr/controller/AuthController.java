package com.slidr.controller;

import com.slidr.model.User;
import com.slidr.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"}) // Autorise Vite
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/signup")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cet email est déjà utilisé !"));
        }
        User saved = userRepository.save(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Inscription réussie !");
        response.put("userId", saved.getId());
        response.put("firstName", saved.getFirstName());
        response.put("lastName", saved.getLastName());
        response.put("email", saved.getEmail());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        Optional<User> dbUser = userRepository.findByEmail(user.getEmail());

        if (dbUser.isPresent() && dbUser.get().getPassword().equals(user.getPassword())) {
            User foundUser = dbUser.get();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Connexion réussie !");
            response.put("userId", foundUser.getId());
            response.put("firstName", foundUser.getFirstName());
            response.put("lastName", foundUser.getLastName());
            response.put("email", foundUser.getEmail());
            
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(401).body(Map.of("error", "Identifiants incorrects."));
    }
}