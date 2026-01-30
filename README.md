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

## 🚀 Lancer le site en local

### Prérequis

Avant de commencer, assurez-vous d'avoir installé :

| Outil | Version minimale | Vérification | Téléchargement |
|-------|------------------|--------------|----------------|
| Node.js | 18+ | `node --version` | https://nodejs.org/ |
| Java JDK | 17+ | `java --version` | https://adoptium.net/ |
| Maven | 3.8+ | `mvn --version` | https://maven.apache.org/ |

### Étape 1 : Cloner le projet

```bash
git clone https://github.com/jules-levecq/Projet_miSemestre.git
cd Projet_miSemestre
```

### Étape 2 : Installer les dépendances frontend

```bash
npm install
```

### Étape 3 : Lancer les serveurs

Vous avez besoin de **2 terminaux** ouverts :

#### Terminal 1 - Backend (API Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

Attendez de voir :
```
Started SlidrApplication in X.XXX seconds
```

#### Terminal 2 - Frontend (React + Vite)

```bash
npm run dev
```

### Étape 4 : Accéder au site

| Page | URL |
|------|-----|
| 🏠 **Page d'accueil** | http://localhost:5173/pages/home.html |
| 🎨 **Éditeur React** | http://localhost:5173/ |
| 🔐 **Connexion** | http://localhost:5173/pages/connexion.html |
| 📝 **Inscription** | http://localhost:5173/pages/inscription.html |
| 📊 **Dashboard** | http://localhost:5173/pages/dashboard.html |
| 🗄️ **Console H2** | http://localhost:8080/h2-console |

### Configuration de la base de données H2

Pour accéder à la console H2 :
- **URL** : http://localhost:8080/h2-console
- **JDBC URL** : `jdbc:h2:file:./data/slidedb`
- **Username** : `sa`
- **Password** : *(laisser vide)*

### ⚠️ Dépannage

**Le backend ne démarre pas ?**
- Vérifiez que vous êtes dans le dossier `backend/`
- Lancez `mvn clean install -DskipTests` avant de relancer

**Le port 5173 est déjà utilisé ?**
- Vite utilisera automatiquement le port 5174

**Les styles CSS ne s'affichent pas ?**
- Videz le cache de votre navigateur (Ctrl+Shift+R)

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
- Sauvegarde automatique des projets dans la base de données
- Chargement des projets existants
- Base de données H2 pour les utilisateurs et projets

## 🔗 API Endpoints

### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/signup` | Inscription (retourne userId) |
| POST | `/api/auth/login` | Connexion (retourne userId) |

### Projets
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/projects/user/{userId}` | Liste des projets d'un utilisateur |
| GET | `/api/projects/{id}` | Récupérer un projet |
| POST | `/api/projects` | Créer un projet |
| PUT | `/api/projects/{id}` | Mettre à jour un projet |
| DELETE | `/api/projects/{id}` | Supprimer un projet |

## 📚 Documentation

- React Flow : https://reactflow.dev/
- Spring Boot : https://spring.io/projects/spring-boot
- Vite : https://vitejs.dev/

## 📄 Documentation supplémentaire
- `docs/ARCHITECTURE.md` : Détails architecturaux (frontend/backend, sérialisation, flux de sauvegarde)
- `docs/API.md` : Référence des endpoints backend et exemples de payloads
- `docs/DEV_SETUP.md` : Guide d'installation et démarrage en développement
- `CONTRIBUTING.md` : Guide pour contribuer au projet

## 👥 Équipe

Projet réalisé dans le cadre du semestre universitaire.
