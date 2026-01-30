# Setup Développement (Front + Backend)

Ce document décrit comment configurer rapidement un environnement local pour le développement.

## Prérequis
- Node.js 18+
- Java 17+
- Maven 3.8+

## Frontend
1. Installer dépendances:
```bash
npm install
```
2. Lancer en dev (ouvre la page home):
```bash
npm run dev
```
3. Build production:
```bash
npm run build
```

## Backend
1. Aller dans le dossier backend:
```bash
cd backend
```
2. Lancer l'application:
```bash
mvn spring-boot:run
```
3. (Optionnel) Builder le jar:
```bash
mvn clean package -DskipTests
java -jar target/*.jar
```

## DB H2
- Console: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:file:./data/slidedb`

## Vérifications rapides
- Frontend : `http://localhost:5173/pages/home.html`
- Backend API : `http://localhost:8080/api/projects`
