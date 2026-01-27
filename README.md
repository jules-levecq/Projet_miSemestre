# Projet_miSemestre - Éditeur de Diapositives Non Linéaires

## 🎯 But du projet

Créer un site web pour **créer, éditer et visionner des diapositives non linéaires**, où les slides sont reliés de manière flexible (pas seulement en séquence).

## 🛠️ Technologies utilisées

- **React** - Framework JavaScript pour l'interface utilisateur
- **Vite** - Outil de build moderne et rapide
- **React Flow (@xyflow/react)** - Bibliothèque pour créer des diagrammes de nœuds interactifs

## 🚀 Installation pour les nouveaux membres

### Prérequis

1. **Installer Node.js** (version 18 ou plus) : https://nodejs.org/
   - Vérifier avec : `node --version`

### Étapes d'installation

```bash
# 1. Cloner le projet (si pas encore fait)
git clone https://github.com/jules-levecq/Projet_miSemestre.git

# 2. Aller dans le dossier
cd Projet_miSemestre

# 3. Installer les dépendances
npm install

# 4. Lancer le serveur de développement
npm run dev
```

Ensuite, ouvrez votre navigateur à l'adresse affichée (généralement http://localhost:5173)

## 📁 Structure du projet

```
Projet_miSemestre/
├── src/                  # Code source React
│   ├── App.jsx          # Composant principal avec React Flow
│   ├── App.css          # Styles du composant
│   ├── main.jsx         # Point d'entrée React
│   └── index.css        # Styles globaux
├── public/              # Fichiers statiques
├── index.html           # Page HTML principale
├── package.json         # Dépendances du projet
└── vite.config.js       # Configuration Vite
```

## 📚 Documentation React Flow

- Site officiel : https://reactflow.dev/
- Exemples : https://reactflow.dev/examples
