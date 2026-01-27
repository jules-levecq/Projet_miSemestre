package com.slidr.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "projects")
@Data
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Lob // Pour stocker de gros volumes de données (le JSON de ton diaporama)
    private String content;

    @ManyToOne
    @JoinColumn(name = "user_id") // Relie le projet à un utilisateur spécifique
    private User user;
}