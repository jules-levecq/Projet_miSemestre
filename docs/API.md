# API - Endpoints et exemples

## Auth

### POST /api/auth/signup
- Description: Crée un nouvel utilisateur
- Payload:
```json
{
  "email": "user@example.com",
  "password": "SuperSecret"
}
```
- Réponse: `201 Created` avec `userId` ou erreur 4xx.

### POST /api/auth/login
- Description: Authentifie un utilisateur
- Payload:
```json
{
  "email": "user@example.com",
  "password": "SuperSecret"
}
```
- Réponse: `200 OK` avec `userId` (simplifié pour le projet).

## Projets

### GET /api/projects/user/{userId}
- Description: Récupère la liste des projets d'un utilisateur
- Réponse: `200 OK`
```json
[
  { "id": "1", "title": "Mon Projet", "createdAt": "..." }
]
```

### POST /api/projects
- Description: Crée un projet
- Payload:
```json
{
  "userId": "123",
  "title": "Mon Projet",
  "content": "{ \"nodes\": [...], \"edges\": [...] }"
}
```
- Réponse: `201 Created` avec l'objet projet

### GET /api/projects/{id}
- Description: Récupère un projet complet (incluant `content`)
- Réponse: `200 OK`
```json
{
  "id": "1",
  "title": "Mon Projet",
  "content": "{ \"nodes\": [...], \"edges\": [...] }"
}
```

### PUT /api/projects/{id}
- Description: Met à jour le titre ou le contenu d'un projet
- Payload:
```json
{
  "title": "Nouveau titre",
  "content": "{ \"nodes\": [...], \"edges\": [...] }"
}
```
- Réponse: `200 OK`

### DELETE /api/projects/{id}
- Description: Supprime le projet
- Réponse: `204 No Content`


> Remarque: Les chemins et formats sont basés sur la structure observée dans le code. Vérifiez `backend/src/main/java/.../controller` pour la signature exacte des endpoints.
