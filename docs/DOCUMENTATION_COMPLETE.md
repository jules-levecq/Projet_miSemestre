# 📚 Documentation Technique Complète - Slid'R

> **Slid'R** - Éditeur de Diapositives Non Linéaires  
> Version 0.0.1-SNAPSHOT | ISEN 2026

---

## 📋 Table des matières

1. [Présentation du Projet](#1-présentation-du-projet)
2. [Architecture Générale](#2-architecture-générale)
3. [Technologies Utilisées](#3-technologies-utilisées)
4. [Installation et Lancement](#4-installation-et-lancement)
5. [Frontend - Structure et Composants](#5-frontend---structure-et-composants)
6. [Backend - API Spring Boot](#6-backend---api-spring-boot)
7. [Base de Données](#7-base-de-données)
8. [Authentification](#8-système-dauthentification)
9. [Fonctionnalités Principales](#9-fonctionnalités-principales)
10. [API REST - Endpoints](#10-api-rest---endpoints)
11. [Diagrammes](#11-diagrammes)
12. [Guide de Développement](#12-guide-de-développement)
13. [Équipe](#13-équipe)

---

## 1. Présentation du Projet

### 🎯 Objectif

Créer un site web pour **créer, éditer et visionner des diapositives non linéaires**, où les slides sont reliées de manière flexible (pas seulement en séquence). L'éditeur offre une interface style Canva/Figma pour personnaliser chaque slide.

### 💡 Concept Innovant

Contrairement à PowerPoint ou Google Slides où les diapositives s'enchaînent linéairement (1 → 2 → 3), Slid'R permet de créer des **présentations arborescentes** :

```
                    ┌─────────────┐
                    │ Introduction│
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            │            ▼
       ┌──────────┐        │     ┌──────────┐
       │ Option A │        │     │ Option B │
       └────┬─────┘        │     └────┬─────┘
            │              │          │
            └──────────────┼──────────┘
                           ▼
                    ┌─────────────┐
                    │  Conclusion │
                    └─────────────┘
```

### 🎓 Cas d'Usage

- **Présentations interactives** : L'orateur choisit le chemin selon les questions
- **Tutoriels adaptatifs** : Parcours différents selon le niveau de l'utilisateur
- **Jeux narratifs** : Histoires à embranchements multiples
- **Formations** : Modules optionnels selon les besoins

---

## 2. Architecture Générale

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Navigateur)                        │
│                                                                      │
│  ┌────────────────────────────┐  ┌────────────────────────────────┐ │
│  │     Pages Statiques        │  │     Application React          │ │
│  │  (HTML/CSS/JS vanilla)     │  │   (Éditeur de diapositives)    │ │
│  │                            │  │                                │ │
│  │  • home.html (Accueil)     │  │  • App.jsx (Graphe de slides)  │ │
│  │  • connexion.html          │  │  • SlideEditor.jsx (Éditeur)   │ │
│  │  • inscription.html        │  │  • SlideViewer.jsx (Lecture)   │ │
│  │  • dashboard.html          │  │  • React Flow (Diagrammes)     │ │
│  └─────────────┬──────────────┘  └────────────────┬───────────────┘ │
│                │                                   │                 │
│                └───────────────┬───────────────────┘                 │
│                                │ HTTP/REST                           │
└────────────────────────────────┼─────────────────────────────────────┘
                                 │
                                 ▼ Port 8080
┌─────────────────────────────────────────────────────────────────────┐
│                        SERVEUR (Spring Boot)                         │
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │  AuthController │  │ ProjectController│  │    Repositories    │  │
│  │  /api/auth/*    │  │  /api/projects/* │  │  (Accès données)   │  │
│  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────┘  │
│           │                    │                       │             │
│           └────────────────────┼───────────────────────┘             │
│                                │ JPA/Hibernate                       │
└────────────────────────────────┼─────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BASE DE DONNÉES H2                              │
│                  Fichier: ./data/slidedb.mv.db                       │
│                                                                      │
│  ┌─────────────────┐              ┌─────────────────┐               │
│  │     USERS       │    1:N       │    PROJECTS     │               │
│  │  (utilisateurs) │◄────────────│   (diaporamas)   │               │
│  └─────────────────┘              └─────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

### Structure des Dossiers

```
Projet_miSemestre/
├── 📄 package.json              # Dépendances npm (frontend)
├── 📄 vite.config.js            # Configuration Vite
├── 📄 index.html                # Point d'entrée principal
├── 📄 app.html                  # Point d'entrée éditeur React
│
├── 📁 pages/                    # Pages HTML statiques
│   ├── home.html                # Page d'accueil
│   ├── connexion.html           # Formulaire de connexion
│   ├── inscription.html         # Formulaire d'inscription
│   └── dashboard.html           # Tableau de bord projets
│
├── 📁 assets/                   # Ressources statiques
│   ├── css/
│   │   ├── home.css             # Styles accueil + dashboard
│   │   └── auth.css             # Styles authentification
│   └── js/
│       ├── home.js              # Logique page accueil
│       ├── dashboard.js         # Logique tableau de bord
│       └── auth.js              # Logique connexion/inscription
│
├── 📁 src/                      # Code source React
│   ├── main.jsx                 # Point d'entrée React
│   ├── App.jsx                  # Composant principal (graphe)
│   ├── App.css                  # Styles de l'éditeur
│   ├── components/
│   │   ├── SlideEditor/         # Éditeur de slide (Canva-like)
│   │   ├── SlideViewer/         # Mode présentation
│   │   ├── SlideNode/           # Nœud personnalisé React Flow
│   │   ├── FlowEditor/          # Éditeur de connexions
│   │   └── Toolbar/             # Barre d'outils
│   ├── data/
│   │   └── initialSlides.js     # Données initiales par défaut
│   └── services/
│       └── api.js               # Communication avec le backend
│
├── 📁 backend/                  # Serveur Spring Boot
│   ├── pom.xml                  # Configuration Maven
│   ├── data/                    # Fichiers base de données H2
│   └── src/main/java/com/slidr/
│       ├── SlidrApplication.java      # Point d'entrée Spring
│       ├── controller/
│       │   ├── AuthController.java    # API authentification
│       │   └── ProjectController.java # API projets
│       ├── model/
│       │   ├── User.java              # Entité utilisateur
│       │   └── Project.java           # Entité projet
│       └── repository/
│           ├── UserRepository.java    # Accès données users
│           └── ProjectRepository.java # Accès données projets
│
└── 📁 docs/                     # Documentation
    └── MAVEN_ET_DATABASE.md     # Guide Maven et BDD
```

---

## 3. Technologies Utilisées

### Frontend

| Technologie | Version | Rôle |
|-------------|---------|------|
| **React** | 18.3 | Framework UI pour l'éditeur de slides |
| **Vite** | 5.4 | Bundler moderne, démarrage rapide |
| **React Flow** | 12.10 | Bibliothèque de diagrammes interactifs |
| **HTML/CSS/JS** | - | Pages statiques (accueil, auth) |

### Backend

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Spring Boot** | 3.2.0 | Framework Java pour API REST |
| **Java** | 17 | Langage de programmation |
| **Maven** | 3.8+ | Gestionnaire de dépendances |
| **H2 Database** | - | Base de données embarquée |
| **JPA/Hibernate** | - | ORM (mapping objet-relationnel) |
| **Lombok** | - | Génération automatique de code |

### Outils de Développement

| Outil | Rôle |
|-------|------|
| **Git/GitHub** | Gestion de version |
| **VS Code** | IDE principal |
| **ESLint** | Linting JavaScript |
| **npm** | Gestionnaire de paquets Node.js |

---

## 4. Installation et Lancement

### Prérequis

| Outil | Version | Vérification |
|-------|---------|--------------|
| Node.js | 18+ | `node --version` |
| Java JDK | 17+ | `java --version` |
| Maven | 3.8+ | `mvn --version` |

### Installation

```bash
# 1. Cloner le projet
git clone https://github.com/jules-levecq/Projet_miSemestre.git
cd Projet_miSemestre

# 2. Installer les dépendances frontend
npm install
```

### Lancement (2 terminaux nécessaires)

#### Terminal 1 - Backend Spring Boot
```bash
cd backend
mvn spring-boot:run
```
> 🟢 Le serveur démarre sur **http://localhost:8080**

#### Terminal 2 - Frontend Vite
```bash
npm run dev
```
> 🟢 L'application s'ouvre sur **http://localhost:5173**

### URLs Importantes

| URL | Description |
|-----|-------------|
| http://localhost:5173/pages/home.html | Page d'accueil |
| http://localhost:5173/app.html | Éditeur de slides (React) |
| http://localhost:8080/h2-console | Console base de données |
| http://localhost:8080/api/auth/* | API authentification |
| http://localhost:8080/api/projects/* | API projets |

---

## 5. Frontend - Structure et Composants

### 5.1 Pages Statiques (HTML/CSS/JS)

#### Page d'Accueil (`home.html`)
- **Fonctionnalité** : Landing page avec effet visuel animé
- **Éléments clés** :
  - Menu tiroir latéral (hover)
  - Boutons Connexion/Inscription ou profil utilisateur
  - Bouton "Nouveau Projet"
  - Canvas animé en arrière-plan

#### Page de Connexion (`connexion.html`)
- **Fonctionnalité** : Authentification utilisateur
- **Champs** : Email, Mot de passe
- **Options** : "Se souvenir de moi", Connexion Google (placeholder)

#### Page d'Inscription (`inscription.html`)
- **Fonctionnalité** : Création de compte
- **Champs** : Prénom, Nom, Email, Mot de passe (x2)
- **Validations** : Force du mot de passe, confirmation

#### Tableau de Bord (`dashboard.html`)
- **Fonctionnalité** : Gestion des projets utilisateur
- **Éléments** :
  - Liste des projets en grille
  - Filtres (favoris) et tri (date, nom)
  - Bouton "Nouveau Projet"
  - Prévisualisation des projets

### 5.2 Application React (Éditeur)

#### App.jsx - Composant Principal

Le cœur de l'éditeur, utilisant **React Flow** pour le graphe de slides.

```jsx
// Structure principale
function App() {
  // États des nœuds (slides) et connexions
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // États de l'interface
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [projectId, setProjectId] = useState(null);
  
  return (
    <div className="app">
      {/* Barre d'outils supérieure */}
      <Toolbar ... />
      
      {/* Zone de travail React Flow */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
      
      {/* Éditeur de slide (modal) */}
      {showEditor && <SlideEditor ... />}
      
      {/* Mode présentation (plein écran) */}
      {showViewer && <SlideViewer ... />}
    </div>
  );
}
```

#### SlideNode - Nœud Personnalisé

Chaque slide est représentée par un nœud avec :
- Titre éditable (Alt + clic)
- Points de connexion (handles) haut/bas
- Double-clic pour ouvrir l'éditeur

```jsx
function SlideNode({ data, id }) {
  // Édition inline du titre
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(data.title);
  
  // Ajustement automatique de la taille de police
  const [fontSize, setFontSize] = useState(12);
  
  return (
    <div className="slide-node">
      <Handle type="target" position={Position.Top} />
      <div className="slide-node-text">{editText}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
```

#### SlideEditor - Éditeur Style Canva

Éditeur visuel complet avec :

| Fonctionnalité | Description |
|----------------|-------------|
| **Templates** | 6 modèles prédéfinis (Titre, Contenu, 2 colonnes...) |
| **Texte** | Ajout, édition, polices, couleurs, alignement |
| **Formes** | Rectangle, cercle, triangle, ligne, flèche |
| **Images** | Import et redimensionnement |
| **Arrière-plan** | Couleur unie ou dégradé |
| **Drag & Drop** | Déplacement et redimensionnement des éléments |

```jsx
// Templates disponibles
const TEMPLATES = [
  { id: 'blank', name: 'Vierge', elements: [] },
  { id: 'title', name: 'Titre', elements: [/* texte centré */] },
  { id: 'content', name: 'Contenu', elements: [/* titre + paragraphe */] },
  { id: 'twoColumns', name: 'Deux colonnes', elements: [/* layout 2 cols */] },
  { id: 'image', name: 'Image + Texte', elements: [/* image + texte */] },
  { id: 'gradient', name: 'Gradient', backgroundColor: 'linear-gradient(...)' },
];

// Formes disponibles
const SHAPES = [
  { type: 'rectangle', icon: '▭' },
  { type: 'circle', icon: '●' },
  { type: 'triangle', icon: '△' },
  { type: 'line', icon: '─' },
  { type: 'arrow', icon: '→' },
];
```

#### SlideViewer - Mode Présentation

Navigation non-linéaire entre les slides :

| Raccourci | Action |
|-----------|--------|
| `Échap` | Quitter la présentation |
| `→` ou `Espace` | Slide suivante (si unique) |
| `←` ou `Retour` | Slide précédente |
| `1-9` | Sélection rapide des choix |
| `H` | Afficher/masquer la navigation |

```jsx
function SlideViewer({ nodes, edges, startSlideId, onClose }) {
  const [currentSlideId, setCurrentSlideId] = useState(startSlideId);
  const [history, setHistory] = useState([]); // Historique de navigation
  
  // Trouver les slides connectées
  const getNextSlides = () => {
    return edges
      .filter(e => e.source === currentSlideId)
      .map(e => nodes.find(n => n.id === e.target));
  };
  
  return (
    <div className="slide-viewer">
      {/* Affichage de la slide courante */}
      <SlidePreview slide={currentSlide} />
      
      {/* Boutons de navigation vers les slides suivantes */}
      <div className="navigation-choices">
        {nextSlides.map((slide, i) => (
          <button key={slide.id} onClick={() => navigateTo(slide.id)}>
            {i + 1}. {slide.data.title}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 5.3 Service API (`api.js`)

Communication avec le backend :

```javascript
const API_URL = 'http://localhost:8080/api';

// Récupérer l'utilisateur connecté
export function getCurrentUser() {
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// CRUD Projets
export async function getProjects(userId) { ... }
export async function getProject(projectId) { ... }
export async function createProject(userId, title, content) { ... }
export async function updateProject(projectId, title, content) { ... }
export async function deleteProject(projectId) { ... }

// Sérialisation React Flow <-> JSON
export function serializeProject(nodes, edges) {
  return JSON.stringify({ nodes, edges });
}

export function deserializeProject(jsonString) {
  return JSON.parse(jsonString);
}
```

---

## 6. Backend - API Spring Boot

### 6.1 Point d'Entrée

```java
@SpringBootApplication
public class SlidrApplication {
    public static void main(String[] args) {
        SpringApplication.run(SlidrApplication.class, args);
        System.out.println("--- SLIDR BACKEND DEMARRÉ SUR LE PORT 8080 ---");
    }
}
```

### 6.2 Controllers (API REST)

#### AuthController - Authentification

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/auth/signup` | POST | Inscription |
| `/api/auth/login` | POST | Connexion |

```java
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/signup")
    public ResponseEntity<?> register(@RequestBody User user) {
        // Vérifier si l'email existe déjà
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Cet email est déjà utilisé !"));
        }
        
        // Sauvegarder l'utilisateur
        User saved = userRepository.save(user);
        
        // Retourner les infos (sans le mot de passe)
        return ResponseEntity.ok(Map.of(
            "message", "Inscription réussie !",
            "userId", saved.getId(),
            "firstName", saved.getFirstName(),
            "lastName", saved.getLastName(),
            "email", saved.getEmail()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        Optional<User> dbUser = userRepository.findByEmail(user.getEmail());

        if (dbUser.isPresent() && dbUser.get().getPassword().equals(user.getPassword())) {
            User foundUser = dbUser.get();
            return ResponseEntity.ok(Map.of(
                "message", "Connexion réussie !",
                "userId", foundUser.getId(),
                "firstName", foundUser.getFirstName(),
                "lastName", foundUser.getLastName(),
                "email", foundUser.getEmail()
            ));
        }
        
        return ResponseEntity.status(401)
            .body(Map.of("error", "Identifiants incorrects."));
    }
}
```

#### ProjectController - Gestion des Projets

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/projects/user/{userId}` | GET | Lister les projets d'un utilisateur |
| `/api/projects/{id}` | GET | Récupérer un projet |
| `/api/projects` | POST | Créer un projet |
| `/api/projects/{id}` | PUT | Modifier un projet |
| `/api/projects/{id}` | DELETE | Supprimer un projet |

```java
@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getProjectsByUser(@PathVariable Long userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body("Utilisateur non trouvé");
        }
        List<Project> projects = projectRepository.findByUser(user.get());
        return ResponseEntity.ok(projects);
    }

    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        String title = (String) request.get("title");
        String content = (String) request.get("content"); // JSON des slides
        
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body("Utilisateur non trouvé");
        }
        
        Project project = new Project();
        project.setTitle(title);
        project.setContent(content);
        project.setUser(user.get());
        
        return ResponseEntity.ok(projectRepository.save(project));
    }
    
    // PUT et DELETE similaires...
}
```

### 6.3 Models (Entités JPA)

#### User.java

```java
@Entity
@Table(name = "users")
@Data  // Lombok : génère getters/setters/toString
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;
}
```

#### Project.java

```java
@Entity
@Table(name = "projects")
@Data
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Lob  // Grande quantité de texte (JSON des slides)
    private String content;

    @ManyToOne  // Relation N:1 avec User
    @JoinColumn(name = "user_id")
    private User user;
}
```

### 6.4 Repositories

```java
// Accès aux utilisateurs
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}

// Accès aux projets
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUser(User user);
}
```

---

## 7. Base de Données

### Configuration H2

```properties
# application.properties

# Base de données persistante
spring.datasource.url=jdbc:h2:file:./data/slidedb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# Création automatique des tables
spring.jpa.hibernate.ddl-auto=update

# Console web
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

### Schéma de la Base

```sql
-- Table USERS
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Table PROJECTS
CREATE TABLE projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    content CLOB,  -- Stocke le JSON des slides
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Accès à la Console H2

1. Démarrer le backend
2. Aller sur http://localhost:8080/h2-console
3. Paramètres :
   - **JDBC URL** : `jdbc:h2:file:./data/slidedb`
   - **User** : `sa`
   - **Password** : *(vide)*

---

## 8. Système d'Authentification

### Flux de Connexion

```
┌─────────────┐                           ┌─────────────────┐
│  Formulaire │  POST /api/auth/login     │  AuthController │
│  Connexion  │ ─────────────────────────►│                 │
│             │   {email, password}       │                 │
└─────────────┘                           └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ UserRepository  │
                                          │ findByEmail()   │
                                          └────────┬────────┘
                                                   │
      ◄────────────────────────────────────────────┘
      │ Réponse JSON :
      │ {userId, firstName, lastName, email}
      ▼
┌─────────────┐
│ localStorage│
│ ou session  │
│  Storage    │
└─────────────┘
```

### Stockage Côté Client

```javascript
// Après connexion réussie
const storage = remember ? localStorage : sessionStorage;
storage.setItem('user', JSON.stringify({ 
    id: data.userId,
    email: data.email, 
    firstName: data.firstName,
    lastName: data.lastName,
    name: `${data.firstName} ${data.lastName}`,
    isLoggedIn: true 
}));
```

### Vérification de l'État de Connexion

```javascript
function getCurrentUser() {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.id) return user;
        } catch { return null; }
    }
    return null;
}
```

---

## 9. Fonctionnalités Principales

### 9.1 Gestion du Graphe de Slides

| Action | Description |
|--------|-------------|
| **Ajouter une slide** | Bouton "+" ou double-clic sur le canvas |
| **Supprimer une slide** | Sélectionner + touche Suppr |
| **Renommer une slide** | Alt + clic sur le titre |
| **Connecter des slides** | Drag depuis un handle vers un autre |
| **Déplacer** | Drag & drop sur le canvas |

### 9.2 Édition de Slide

| Outil | Description |
|-------|-------------|
| **Texte** | Clic pour ajouter, double-clic pour éditer |
| **Formes** | Rectangle, cercle, triangle, ligne, flèche |
| **Images** | Upload via le panel ou drag & drop |
| **Arrière-plan** | Couleur unie ou dégradé |
| **Templates** | 6 modèles prédéfinis |

### 9.3 Mode Présentation

- Navigation via boutons ou clavier
- Choix multiples affichés si plusieurs connexions
- Historique de navigation (retour possible)
- Mode plein écran

### 9.4 Sauvegarde

- **Automatique** : À chaque modification importante
- **Manuelle** : Bouton "Sauvegarder" (Ctrl+S)
- **Format** : JSON contenant nodes + edges de React Flow

```json
{
  "nodes": [
    {
      "id": "slide-1",
      "type": "slide",
      "position": { "x": 250, "y": 0 },
      "data": { 
        "title": "Introduction",
        "content": { /* éléments du slide */ }
      }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "slide-1", "target": "slide-2" }
  ]
}
```

---

## 10. API REST - Endpoints

### Authentification

| Méthode | Endpoint | Body | Réponse |
|---------|----------|------|---------|
| POST | `/api/auth/signup` | `{firstName, lastName, email, password}` | `{userId, firstName, lastName, email}` |
| POST | `/api/auth/login` | `{email, password}` | `{userId, firstName, lastName, email}` |

### Projets

| Méthode | Endpoint | Body | Réponse |
|---------|----------|------|---------|
| GET | `/api/projects/user/{userId}` | - | `[{id, title, content, user}]` |
| GET | `/api/projects/{id}` | - | `{id, title, content, user}` |
| POST | `/api/projects` | `{userId, title, content}` | `{id, title, content, user}` |
| PUT | `/api/projects/{id}` | `{title?, content?}` | `{id, title, content, user}` |
| DELETE | `/api/projects/{id}` | - | `200 OK` |

### Codes d'Erreur

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 400 | Requête invalide (email déjà utilisé, etc.) |
| 401 | Non autorisé (identifiants incorrects) |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur |

---

## 11. Diagrammes

### Diagramme de Séquence - Création de Projet

```
┌─────────┐       ┌─────────┐       ┌─────────────────┐       ┌────────┐
│  User   │       │ Frontend│       │ ProjectController│       │   DB   │
└────┬────┘       └────┬────┘       └────────┬────────┘       └────┬───┘
     │                 │                      │                     │
     │  Clic "Nouveau" │                      │                     │
     │────────────────>│                      │                     │
     │                 │                      │                     │
     │                 │  POST /api/projects  │                     │
     │                 │  {userId, title}     │                     │
     │                 │─────────────────────>│                     │
     │                 │                      │                     │
     │                 │                      │  findById(userId)   │
     │                 │                      │────────────────────>│
     │                 │                      │                     │
     │                 │                      │     User found      │
     │                 │                      │<────────────────────│
     │                 │                      │                     │
     │                 │                      │  save(project)      │
     │                 │                      │────────────────────>│
     │                 │                      │                     │
     │                 │                      │   Saved project     │
     │                 │                      │<────────────────────│
     │                 │                      │                     │
     │                 │   {id, title, ...}   │                     │
     │                 │<─────────────────────│                     │
     │                 │                      │                     │
     │  Redirection    │                      │                     │
     │  vers éditeur   │                      │                     │
     │<────────────────│                      │                     │
```

### Modèle de Données

```
┌─────────────────────────────────┐
│            USER                 │
├─────────────────────────────────┤
│ + id : Long (PK)                │
│ + firstName : String            │
│ + lastName : String             │
│ + email : String (UNIQUE)       │
│ + password : String             │
└───────────────┬─────────────────┘
                │ 1
                │
                │ owns
                │
                │ *
┌───────────────┴─────────────────┐
│           PROJECT               │
├─────────────────────────────────┤
│ + id : Long (PK)                │
│ + title : String                │
│ + content : String (JSON)       │
│ + user_id : Long (FK)           │
└─────────────────────────────────┘
```

---

## 12. Guide de Développement

### Ajouter une Nouvelle Fonctionnalité

#### Frontend (React)

1. Créer le composant dans `src/components/`
2. Ajouter les styles dans un fichier `.css`
3. Importer dans `App.jsx` si nécessaire
4. Ajouter la route/logique appropriée

#### Backend (Spring Boot)

1. Créer/modifier le model dans `model/`
2. Créer/modifier le repository dans `repository/`
3. Ajouter l'endpoint dans le controller
4. Tester avec Postman ou curl

### Commandes Utiles

```bash
# Frontend
npm run dev          # Lancer en développement
npm run build        # Build de production
npm run lint         # Vérifier le code

# Backend
mvn spring-boot:run  # Lancer le serveur
mvn clean install    # Compiler le projet
mvn test             # Exécuter les tests
```

### Bonnes Pratiques

1. **Commits** : Messages clairs et descriptifs
2. **Branches** : Une branche par fonctionnalité
3. **Code** : Commenter les fonctions complexes
4. **Tests** : Tester avant de commit

---

## 13. Équipe

| Nom | Rôle |
|-----|------|
| **Oscar NICOLAS** | Manager de Projet / Dev |
| **Benoit CHIREZ** | Responsable Technique |
| **Rémy AGEZ** | Dev / Design |
| **Romain TOFFANELLI** | Dev / Design |
| **Jules LEVECQ** | Dev / Support émotionnel |
| **Paul DELPIERRE** | Dev |
| **Erwan GRAIRE** | Dev |
| **Dorian MASSARD** | Dev |
| **Ines KONLACK NGAFFO** | Dev |

---

## 📎 Ressources

- [Documentation React](https://react.dev/)
- [Documentation React Flow](https://reactflow.dev/)
- [Documentation Spring Boot](https://docs.spring.io/spring-boot/)
- [Documentation Vite](https://vitejs.dev/)
- [Guide H2 Database](https://www.h2database.com/)

---

*Documentation Slid'R - ISEN 2026*
