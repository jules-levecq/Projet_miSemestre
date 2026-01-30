# Présentation technique complète — Projet_miSemestre

Date: 30 janvier 2026
Auteur: équipe Projet_miSemestre

---

Cette version est destinée à un public technique (enseignants, examinateurs, développeurs) et décrit précisément le code, l'architecture, le flux de données, les composants, les API et les décisions d'implémentation.

**Objectif**: fournir une base de démonstration et d'évaluation technique pour le projet.

---

**Structure de ce document (rapide)**
- Vue d'ensemble du système
- Description fichier-par-fichier (frontend + backend)
- Flux de données et sérialisation
- Composants clés et exemples de code
- API REST (contrôleurs, payloads, erreurs)
- Développement local, tests et debugging
- Détails d'implémentation (undo, clipboard, multi-sélection, autosave)
- Limitations connues et recommandations

---

**1) Vue d'ensemble technique**

- Frontend: React 18 + Vite, usage intensif de React Flow (@xyflow/react) pour représenter le graphe de slides.
- Backend: Spring Boot (Java), contrôleurs REST exposant un CRUD sur les projets, persistence via JPA/H2 (dev).
- Communication: JSON sur HTTP. Frontend sérialise l'état `nodes`/`edges` et le backend stocke la chaîne dans une colonne `content`.

---

**2) Fichiers et responsabilités (fichier-par-fichier)**

- `src/App.jsx` (coeur du frontend)
  - Gère l'état global: `nodes`, `edges`, `currentProjectId`, `currentProjectTitle`, `currentSlide` (éditeur), `isViewing` (viewer), `viewerStartSlide`, `slideCounter`.
  - Effets principaux:
    - Lecture d'un projet au chargement (`getProject`, `deserializeProject`).
    - Création initiale de projet si `isNewProject`.
    - Auto-save: debounce 1000ms qui appelle `updateProject(currentProjectId, title, serializeProject(nodes, edges))`.
    - Écoute d'événement `openSlideEditor` pour ouvrir `SlideEditor`.
  - Fonctions clés:
    - `onConnect(params)`: ajoute une arête (évite duplicata, supprime l'inverse si nécessaire), configure `arrowHeadType`.
    - `handleBackToFlow()`: vide `currentSlide` (retour à la vue globale sans navigation extérieure).
    - `startPresentation(startSlideId)`: positionne `viewerStartSlide` et active le viewer.
    - `handleEdgeClick(event, edge)`: ouvre le menu contextuel d'arête (voir `edgeMenu` et fonctions `setEdgeUnique`, `setEdgeDouble`, `deleteEdgeById`).
    - Gestion clavier globale: écoute `keydown` pour `Delete`, `Ctrl/Cmd+C/V/Z` (copier, coller avec offset, undo à partir d'une pile `nodesHistoryRef`).

- `src/components/SlideEditor/SlideEditor.jsx`
  - Composant d'édition d'une seule slide.
  - Implémente la multi-sélection (marquee) en mode éditeur via `Alt+drag`:
    - Événements `onMouseDown`, `onMouseMove`, `onMouseUp` calculent un rectangle de sélection.
    - `selectNodesInRect(rect)` marque `node.selected = true` pour les nodes dans le rectangle.
  - Edition du contenu, fond, palette, sauvegarde locale puis `onSave(slideId, slideData)` envoyé à `App.jsx`.

- `src/components/SlideViewer/SlideViewer.jsx`
  - Composant de mode présentation.
  - Navigation entre slides: avance/recul selon edges sortantes. Si une arête est marquée "sens unique", le viewer bloque la navigation arrière (implémentation: vérifie l'arête active et son `markerStart`/`arrowHeadType`).

- `src/services/api.js` (ou `src/services/api/index.js`)
  - Fonctions exposées au frontend:
    - `getCurrentUser()` — lecture du user courant (localStorage / session).
    - `createProject(userId, title, content)` — POST projet.
    - `updateProject(id, title, content)` — PUT projet.
    - `getProject(id)` — GET projet.
    - `serializeProject(nodes, edges)` et `deserializeProject(content)` — sérialisation JSON de l'état React Flow.
  - La sérialisation: JSON.stringify({ nodes, edges }). Chaque `node.data` contient les propriétés spécifiques (title, elements, fontSize, backgroundColor).

- `backend/` (Spring Boot)
  - Contrôleurs: `ProjectController` exposant `POST /api/projects`, `GET /api/projects/{id}`, `PUT /api/projects/{id}`.
  - Entités: `Project` { id, ownerId, title, content, createdAt, updatedAt }.
  - Repositories: `ProjectRepository extends JpaRepository<Project, Long>`.
  - Services: logique métier (validate owner, écrire content, journalisation).

---

**3) Flux de données et sérialisation**

- A partir du frontend: `serializeProject(nodes, edges)` produit un objet JSON contenant la liste complète des `nodes` et `edges` tels qu'utilisés par React Flow. Exemple minimal:

  {
    "nodes": [{ "id":"1", "type":"slide", "position":{x:250,y:100}, "data":{ "title":"Accueil" }}],
    "edges": [{ "id":"e1-2", "source":"1", "target":"2", "arrowHeadType":"arrow" }]
  }

- Le backend stocke cette chaîne dans la colonne `content`. À la réouverture: `getProject(id)` retourne `title` + `content` que le frontend `deserializeProject` reconstruit en tableaux `nodes`/`edges` pour React Flow.

---

**4) Comportements détaillés & décisions d'implémentation**

- Auto-save: Débounce 1s à partir du dernier changement (`useEffect` sur `nodes`/`edges`). Avantage: limite les appels réseau, inconvénient: perte possible si navigateur crash avant le délai.

- Undo / History: `nodesHistoryRef` stocke des snapshots JSON (max 40). On push avant les opérations destructrices: ajout/suppression/arête/duplication. Undo restaure nodes+edges.

- Clipboard local: `clipboardNodeRef` conserve une copie profonde (JSON) du node sélectionné. Coller incrémente `slideCounter` et décale `position` de (+30,+30).

- Gestion d'arêtes: La fonction `onConnect` évite les duplicatas en vérifiant `eds.some(e => e.source===p.source && e.target===p.target)`. Lorsqu'on applique "sens unique", on supprime l'inverse éventuel; pour "double sens" on encode les deux marqueurs sur la même arête (`markerStart: 'arrow', arrowHeadType: 'arrow'`).

- Navigation / retour:
  - `SlideViewer` vérifie la direction des arêtes et bloque le retour si l'arête courante est à sens unique.
  - `handleBackToFlow()` dans `App.jsx` remet `currentSlide=null` pour revenir à la vue globale; le bouton global "Retour" dans l'en-tête redirige vers `/pages/dashboard.html`.

---

**5) Extraits de code (points cruciaux)**

- Auto-save (simplifié):

```js
useEffect(() => {
  const timer = setTimeout(async () => {
    if (currentProjectId) {
      const content = serializeProject(nodes, edges);
      await updateProject(currentProjectId, currentProjectTitle, content);
    }
  }, 1000);
  return () => clearTimeout(timer);
}, [nodes, edges, currentProjectId]);
```

- Ajout d'arête (prévention duplicata et gestion inverse):

```js
const onConnect = (params) => {
  setEdges((eds) => {
    const exists = eds.some(e => e.source === params.source && e.target === params.target);
    if (exists) return eds;
    const withoutReverse = eds.filter(e => !(e.source === params.target && e.target === params.source));
    return addEdge({ ...params, id: `e${params.source}-${params.target}`, arrowHeadType: 'arrow' }, withoutReverse);
  });
};
```

- Gestion clavier global (copier/coller/undo/suppr):

```js
window.addEventListener('keydown', (event) => {
  if ((event.ctrlKey||event.metaKey) && event.key==='c') { /* copy */ }
  if ((event.ctrlKey||event.metaKey) && event.key==='v') { /* paste with offset */ }
  if ((event.ctrlKey||event.metaKey) && event.key==='z') { /* undo from nodesHistoryRef */ }
  if (event.key==='Delete') { /* delete selected */ }
});
```

---

**6) API REST — Contrôleur / Payloads (exemples)**

- POST /api/projects
  - Body: `{ "ownerId": 12, "title": "Mon projet", "content": "{...serialized...}" }`
  - Réponse 201: `{ id, ownerId, title, content, createdAt }`

- GET /api/projects/{id}
  - Réponse 200: `{ id, ownerId, title, content, createdAt, updatedAt }`

- PUT /api/projects/{id}
  - Body: `{ "title": "nouveau titre", "content": "{...}" }`
  - Réponse 200: projet mis à jour.

Gestion des erreurs: valider que `content` est du JSON valide côté backend; renvoyer 400 pour payload invalide, 404 si projet introuvable, 401/403 pour accès refusé.

---

**7) Exécution locale & debug rapide**

- Frontend (depuis la racine):
```bash
npm install
npm run dev
```
Le script `dev` open `/pages/home.html` par défaut (voir `package.json`).

- Backend:
```bash
cd backend
mvn spring-boot:run
```

Debug tips:
- Ouvrir la console du navigateur pour voir les logs `console.log` injectés par `App.jsx` (ex: `handleSaveSlide` affiche changements).
- Si les modifications ne s'affichent pas, vérifier `localStorage` (`currentProjectId`, `currentProjectTitle`) et le contenu renvoyé par l'API.

---

**8) Tests et CI**

- Backend: `mvn test` (JUnit). Ajouter tests d'intégration pour les endpoints de `ProjectController`.
- Frontend: recommander d'ajouter Jest + React Testing Library pour:
  - snapshots des composants UI critiques (`SlideEditor`, `SlideViewer`)
  - tests unitaires pour `serializeProject` / `deserializeProject`.

---

**9) Limitations connues & recommandations**

- Sauvegarde: si l'utilisateur ferme le navigateur immédiatement après une action, le debounce peut perdre la dernière modification. Recommander un flush explicite sur `beforeunload`.
- Undo granulaire: l'implémentation actuelle stocke des snapshots complets; cela utilise de la mémoire pour de grands projets. On peut améliorer en stockant opérations inverses (command pattern).
- Conflits multi-utilisateurs: actuellement non prévu. Pour collaboration en temps réel, ajouter WebSocket + stratégie de résolution de conflits.

---

**10) Roadmap technique (priorités)**

- Court terme:
  - Ajouter tests unitaires et e2e.
  - Export Reveal.js / PDF depuis le Markdown `docs/PRESENTATION.md`.
  - Ajouter flush autosave avant `beforeunload`.

- Moyen terme:
  - Auth complète et gestion des droits (JWT, roles).
  - Mode historique/versioning pour projets.

- Long terme:
  - Collaboration temps réel.
  - Import/Export PPTX, améliorations UX avancées.

---

**Annexes & ressources**

- Fichiers clefs:
  - [src/App.jsx](src/App.jsx) — coeur du frontend
  - [src/components/SlideEditor/SlideEditor.jsx](src/components/SlideEditor/SlideEditor.jsx)
  - [src/components/SlideViewer/SlideViewer.jsx](src/components/SlideViewer/SlideViewer.jsx)
  - `backend/` — contrôleurs JPA/Spring Boot

---

Si vous le souhaitez, je peux:
- Générer un diaporama Reveal.js à partir de ce markdown (`docs/presentation.html`).
- Produire un PDF exportable.
- Préparer une version courte (10 slides) pour la soutenance.

Dites-moi quelle sortie vous préférez et je l'automatise (Reveal.js / PDF / slides Markdown).



