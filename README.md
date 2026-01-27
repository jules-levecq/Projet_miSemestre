# Projet_miSemestre - Éditeur de Diapositives Non Linéaires

## 🎯 But du projet

Créer un site web pour **créer, éditer et visionner des diapositives non linéaires**, où les slides sont reliées de manière flexible (pas seulement en séquence). L'éditeur offre une interface style Canva/Figma pour personnaliser chaque slide.

## 🛠️ Technologies utilisées

### Frontend
- **React 18** - Framework JavaScript pour l'interface utilisateur
- **Vite 5** - Outil de build moderne et rapide
- **React Flow (@xyflow/react)** - Bibliothèque pour créer des diagrammes de nœuds interactifs
- **HTML/CSS/JS** - Pages statiques (accueil, connexion, inscription)

### Backend
- **Spring Boot 3.2** - Framework Java pour l'API REST
- **H2 Database** - Base de données embarquée (persistante)
- **JPA/Hibernate** - ORM pour la gestion des données
- **Maven** - Gestionnaire de dépendances Java

## 🚀 Installation

### Prérequis

1. **Node.js** (version 18+) : https://nodejs.org/
   - Vérifier avec : `node --version`

2. **Java JDK** (version 17+) : https://adoptium.net/
   - Vérifier avec : `java --version`

3. **Maven** (version 3.8+) : https://maven.apache.org/
   - Vérifier avec : `mvn --version`

### Installation du Frontend

```bash
# 1. Cloner le projet
git clone https://github.com/jules-levecq/Projet_miSemestre.git

# 2. Aller dans le dossier
cd Projet_miSemestre

# 3. Installer les dépendances
npm install

# 4. Lancer le serveur de développement
npm run dev
```

Le frontend sera accessible sur http://localhost:5173 ou http://localhost:5174

### Installation du Backend

```bash
# 1. Aller dans le dossier backend
cd backend

# 2. Compiler et lancer le serveur
mvn clean install -DskipTests && mvn spring-boot:run
```

Le backend sera accessible sur http://localhost:8080

### Console H2 (Base de données)

- URL : http://localhost:8080/h2-console
- JDBC URL : `jdbc:h2:file:./data/slidedb`
- Username : `sa`
- Password : *(laisser vide)*

## 📁 Structure du projet

```
Projet_miSemestre/
├── src/                              # Code source React
│   ├── App.jsx                       # Composant principal (gestion des vues)
│   ├── App.css                       # Styles globaux React
│   ├── components/
│   │   ├── FlowEditor/               # Éditeur de graphe (React Flow)
│   │   ├── SlideEditor/              # Éditeur de slide style Canva
│   │   └── Toolbar/                  # Barre d'outils
│   └── data/
│       └── initialSlides.js          # Données initiales des slides
│
├── pages/                            # Pages HTML statiques
│   ├── home.html                     # Page d'accueil
│   ├── connexion.html                # Page de connexion
│   └── inscription.html              # Page d'inscription
│
├── assets/                           # Ressources statiques
│   ├── css/
│   │   ├── auth.css                  # Styles authentification
│   │   └── home.css                  # Styles page d'accueil
│   └── js/
│       ├── auth.js                   # Logique connexion/inscription
│       └── home.js                   # Logique page d'accueil
│
├── backend/                          # Backend Spring Boot
│   ├── src/main/java/com/slidr/
│   │   ├── SlidrApplication.java     # Point d'entrée Spring
│   │   ├── controller/
│   │   │   └── AuthController.java   # API authentification
│   │   ├── model/
│   │   │   ├── User.java             # Entité utilisateur
│   │   │   └── Project.java          # Entité projet
│   │   └── repository/               # Repositories JPA
│   ├── src/main/resources/
│   │   └── application.properties    # Configuration Spring
│   └── pom.xml                       # Dépendances Maven
│
├── index.html                        # Point d'entrée Vite
├── app.html                          # Alias vers l'éditeur React
├── package.json                      # Dépendances npm
└── vite.config.js                    # Configuration Vite
```

## ✨ Fonctionnalités

### Éditeur de Graphe (React Flow)
- Créer des slides interconnectées
- Glisser-déposer pour réorganiser
- Connexions flexibles entre slides
- Double-clic pour éditer une slide

### Éditeur de Slide (Style Canva)
- 6 templates prédéfinis
- Ajout de texte, formes, images
- 10 polices disponibles
- Redimensionnement avec 8 poignées
- Palette de couleurs
- Contrôles de zoom

### Authentification
- Inscription avec validation
- Connexion sécurisée
- Indicateur de force du mot de passe
- Stockage en base de données H2

### Persistance
- Sauvegarde automatique dans localStorage (frontend)
- Base de données H2 pour les utilisateurs (backend)

## 🔗 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/signup` | Inscription |
| POST | `/api/auth/login` | Connexion |

## 📚 Documentation

- React Flow : https://reactflow.dev/
- Spring Boot : https://spring.io/projects/spring-boot
- Vite : https://vitejs.dev/

## 👥 Équipe

Projet réalisé dans le cadre du semestre universitaire.
