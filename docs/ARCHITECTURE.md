# Architecture du projet Projet_miSemestre

## Vue d'ensemble
Ce projet est composé de deux parties principales :

- Frontend : application React (Vite) qui fournit l'éditeur visuel, le visualiseur (présentation) et les pages statiques (authentification, dashboard, etc.).
- Backend : API REST en Spring Boot qui gère les utilisateurs, projets et la persistance (H2 DB).

Les slides sont représentées côté frontend sous forme de nœuds (nodes) et les connexions sous forme d'arêtes (edges). Le backend stocke une sérialisation JSON du graphe (nodes + edges) associée à chaque projet.

## Frontend

- Entrée : `src/App.jsx` (composant principal) organise les vues : flow (graphe), slide editor, slide viewer.
- Composants notables :
  - `SlideEditor` : éditeur de contenu de slide (canvas interne, éléments, templates, drag/resize, multi-selection).
  - `SlideViewer` : mode présentation (naviguer entre slides selon les arêtes).
  - `SlideNode` : rendu d'un nœud slide (titre, handlers de double-clic).
  - Utilisation de `@xyflow/react` (fork/variant de React Flow) pour afficher et manipuler le graphe.

## Backend

- Point d'entrée : `backend/src/main/java/.../SlidrApplication.java` (Spring Boot).
- Principaux packages : `controller`, `model`, `repository`, `service` (si présent).
- Les projets sont persistés via une entité `Project` qui contient : id, titre, contenu (serialized nodes/edges), date de création, propriétaire.
- Base de données utilisée : H2 (fichier local `./data/`), accessible via la console H2.

## Sérialisation

- Le frontend sérialise `nodes` et `edges` en JSON via `serializeProject(nodes, edges)` (service frontend), puis envoie ce JSON au backend lors de la création ou mise à jour d'un projet.
- À la récupération, le backend renvoie ce JSON qui est désérialisé en `nodes` et `edges` puis réinjecté dans React Flow.

## Flux de sauvegarde

1. L'utilisateur modifie le graphe (nodes/edges) ou édite une slide.
2. Le frontend déclenche une sauvegarde (autosave debounced 1s) : il appelle `PUT /api/projects/{id}` avec le JSON sérialisé.
3. Le backend met à jour l'enregistrement `Project`.

## Décisions techniques et alternatives

- React Flow a été choisi pour la flexibilité des graphes ; si besoin de performance pour grands graphes, envisager une approche WebGL.
- H2 est pratique pour dev/test ; pour production, migrer vers PostgreSQL/MySQL.

## Limitations connues

- Undo/redo limité (pile en mémoire côté frontend, non persistée).
- Multi-sélection initiale implémentée côté éditeur, pas (encore) via les APIs avancées de React Flow.
- Les marqueurs d'arêtes (double-sens) dépendent du support des `markerStart` dans la version utilisée.
