# 🗄️ Guide Complet : Base de Données dans Slid'R

> Ce document explique en détail le fonctionnement de la base de données H2 avec JPA/Hibernate dans le projet Slid'R.

---

## 📋 Table des matières

1. [Vue d'Ensemble](#1-vue-densemble)
2. [H2 Database](#2-quest-ce-que-h2-)
3. [JPA/Hibernate - Le Traducteur](#3-jpahibernate---le-traducteur)
4. [Les Repositories](#4-les-repositories---laccès-aux-données)
5. [Les Relations entre Tables](#5-les-relations-entre-tables)
6. [Flux Complet](#6-flux-complet--de-la-requête-http-à-la-bdd)
7. [Configuration Détaillée](#7-configuration-détaillée)
8. [Console H2](#8-console-h2---visualiser-les-données)
9. [Résumé](#9-résumé-en-une-image)

---

## 1. Vue d'Ensemble

Le projet utilise **H2 Database** avec **JPA/Hibernate** pour stocker les données. Voici comment tout s'articule :

```
┌─────────────────────────────────────────────────────────────────┐
│                        TON CODE JAVA                             │
│                                                                  │
│   UserRepository.save(user)     ←── Tu manipules des OBJETS     │
│   projectRepository.findByUser(user)                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼ JPA/Hibernate traduit en SQL
┌─────────────────────────────────────────────────────────────────┐
│                      HIBERNATE (ORM)                             │
│                                                                  │
│   INSERT INTO users (first_name, last_name, email, password)    │
│   VALUES ('Oscar', 'Nicolas', 'oscar@test.com', '1234')         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼ SQL exécuté sur la base
┌─────────────────────────────────────────────────────────────────┐
│                    BASE DE DONNÉES H2                            │
│                                                                  │
│   Fichier : backend/data/slidedb.mv.db                          │
│   (Stockage persistant sur le disque)                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Qu'est-ce que H2 ?

**H2** est une base de données relationnelle **écrite en Java** et **embarquée** dans l'application.

### Avantages de H2

| Avantage | Explication |
|----------|-------------|
| **Embarquée** | Pas besoin d'installer MySQL, PostgreSQL, etc. H2 est inclus dans le JAR |
| **Légère** | ~2 Mo seulement |
| **Rapide** | Démarre en quelques millisecondes |
| **Console Web** | Interface graphique intégrée pour voir les données |
| **Compatible SQL** | Mêmes requêtes que MySQL/PostgreSQL |

### Mode de Fonctionnement

```properties
# Dans application.properties
spring.datasource.url=jdbc:h2:file:./data/slidedb
```

Cette URL signifie :
- `jdbc:h2:` → Utilise le driver H2
- `file:` → Mode **fichier** (données persistantes)
- `./data/slidedb` → Chemin du fichier de base de données

**Résultat** : Un fichier `slidedb.mv.db` est créé dans `backend/data/`

```
backend/
└── data/
    ├── slidedb.mv.db      ← Les données (tables, lignes)
    └── slidedb.trace.db   ← Logs de debug (optionnel)
```

---

## 3. JPA/Hibernate - Le Traducteur

### Qu'est-ce que JPA ?

**JPA** (Java Persistence API) est une **spécification** qui définit comment mapper des objets Java vers des tables SQL.

**Hibernate** est l'**implémentation** de JPA que Spring Boot utilise par défaut.

### Le Mapping Objet-Relationnel (ORM)

```
     JAVA (Objet)                         SQL (Table)
┌─────────────────────┐            ┌─────────────────────┐
│    class User       │            │    TABLE users      │
├─────────────────────┤            ├─────────────────────┤
│ Long id             │  ══════►   │ id BIGINT (PK)      │
│ String firstName    │  ══════►   │ first_name VARCHAR  │
│ String lastName     │  ══════►   │ last_name VARCHAR   │
│ String email        │  ══════►   │ email VARCHAR       │
│ String password     │  ══════►   │ password VARCHAR    │
└─────────────────────┘            └─────────────────────┘
```

### Comment ça marche concrètement ?

#### Étape 1 : Définir une Entité

```java
@Entity                              // "Cette classe = une table"
@Table(name = "users")               // Nom de la table
public class User {

    @Id                              // Clé primaire
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Auto-incrément
    private Long id;

    @Column(nullable = false)        // NOT NULL en SQL
    private String firstName;

    @Column(unique = true)           // UNIQUE en SQL
    private String email;
    
    // ... getters/setters générés par Lombok
}
```

#### Étape 2 : Hibernate crée la table automatiquement

Grâce à cette configuration :
```properties
spring.jpa.hibernate.ddl-auto=update
```

Au démarrage, Hibernate exécute :
```sql
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
```

#### Étape 3 : Utiliser des méthodes Java, pas du SQL

```java
// TON CODE :
User user = new User();
user.setFirstName("Oscar");
user.setLastName("Nicolas");
user.setEmail("oscar@test.com");
user.setPassword("secret123");

userRepository.save(user);  // ← Une seule ligne Java !

// HIBERNATE GÉNÈRE ET EXÉCUTE :
// INSERT INTO users (first_name, last_name, email, password) 
// VALUES ('Oscar', 'Nicolas', 'oscar@test.com', 'secret123')
```

### Annotations JPA Importantes

| Annotation | Rôle | Équivalent SQL |
|------------|------|----------------|
| `@Entity` | Déclare la classe comme table | `CREATE TABLE` |
| `@Table(name="...")` | Nom personnalisé de la table | Nom de la table |
| `@Id` | Clé primaire | `PRIMARY KEY` |
| `@GeneratedValue` | Auto-incrément | `AUTO_INCREMENT` |
| `@Column(nullable=false)` | Colonne obligatoire | `NOT NULL` |
| `@Column(unique=true)` | Valeur unique | `UNIQUE` |
| `@Lob` | Grand volume de données | `CLOB` / `BLOB` |
| `@ManyToOne` | Relation N:1 | `FOREIGN KEY` |
| `@JoinColumn` | Nom de la clé étrangère | `REFERENCES` |

---

## 4. Les Repositories - L'Accès aux Données

### Qu'est-ce qu'un Repository ?

Un Repository est une **interface** qui hérite de `JpaRepository`. Spring génère **automatiquement** l'implémentation !

```java
public interface UserRepository extends JpaRepository<User, Long> {
    //                                              ▲      ▲
    //                                         Entité   Type de l'ID
    
    Optional<User> findByEmail(String email);
    // Spring génère automatiquement le SQL !
}
```

### Méthodes Gratuites (héritées)

En étendant `JpaRepository`, on obtient ces méthodes **sans écrire de code** :

| Méthode | SQL Généré | Exemple d'utilisation |
|---------|------------|----------------------|
| `save(entity)` | `INSERT INTO ...` ou `UPDATE ...` | `userRepo.save(newUser)` |
| `findById(id)` | `SELECT * FROM ... WHERE id = ?` | `userRepo.findById(1L)` |
| `findAll()` | `SELECT * FROM ...` | `userRepo.findAll()` |
| `deleteById(id)` | `DELETE FROM ... WHERE id = ?` | `userRepo.deleteById(1L)` |
| `count()` | `SELECT COUNT(*) FROM ...` | `userRepo.count()` |
| `existsById(id)` | `SELECT 1 FROM ... WHERE id = ?` | `userRepo.existsById(1L)` |

### Méthodes Personnalisées (Query Methods)

Spring analyse le **nom de la méthode** pour générer le SQL :

```java
// Méthode dans UserRepository
Optional<User> findByEmail(String email);

// Spring comprend :
// "find" = SELECT
// "By" = WHERE
// "Email" = colonne email
// Paramètre String email = valeur à chercher

// SQL généré :
// SELECT * FROM users WHERE email = ?
```

**Autres exemples :**

| Nom de la méthode | SQL Généré |
|-------------------|------------|
| `findByEmail(email)` | `SELECT * FROM users WHERE email = ?` |
| `findByFirstName(name)` | `SELECT * FROM users WHERE first_name = ?` |
| `findByUser(user)` | `SELECT * FROM projects WHERE user_id = ?` |
| `findByTitleContaining(text)` | `SELECT * FROM projects WHERE title LIKE '%text%'` |
| `findByUserOrderByIdDesc(user)` | `SELECT * FROM projects WHERE user_id = ? ORDER BY id DESC` |
| `countByUser(user)` | `SELECT COUNT(*) FROM projects WHERE user_id = ?` |
| `existsByEmail(email)` | `SELECT 1 FROM users WHERE email = ?` |

---

## 5. Les Relations entre Tables

### Relation ManyToOne (N:1)

Dans le projet, un **User** peut avoir **plusieurs Projects**, mais un **Project** appartient à **un seul User**.

```java
// Dans Project.java
@ManyToOne                       // Plusieurs projets → 1 utilisateur
@JoinColumn(name = "user_id")    // Nom de la clé étrangère
private User user;
```

**Schéma de la relation :**

```
┌─────────────────────┐              ┌─────────────────────┐
│       USERS         │              │      PROJECTS       │
├─────────────────────┤              ├─────────────────────┤
│ id = 1              │◄─────────────│ user_id = 1         │
│ firstName = "Oscar" │      │       │ id = 1              │
│ lastName = "Nicolas"│      │       │ title = "Projet A"  │
│ email = "oscar@..." │      │       └─────────────────────┘
│ password = "..."    │      │
└─────────────────────┘      │       ┌─────────────────────┐
                             └───────│ user_id = 1         │
                                     │ id = 2              │
                                     │ title = "Projet B"  │
                                     └─────────────────────┘
```

**En SQL, ça donne :**

```sql
-- Table projects avec clé étrangère
CREATE TABLE projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    content CLOB,
    user_id BIGINT,                              -- Clé étrangère
    FOREIGN KEY (user_id) REFERENCES users(id)   -- Contrainte
);
```

### Types de Relations JPA

| Type | Signification | Exemple |
|------|---------------|---------|
| `@OneToOne` | 1:1 | Un utilisateur a un profil |
| `@OneToMany` | 1:N | Un utilisateur a plusieurs projets |
| `@ManyToOne` | N:1 | Plusieurs projets appartiennent à un utilisateur |
| `@ManyToMany` | N:N | Des utilisateurs peuvent partager des projets |

---

## 6. Flux Complet : De la Requête HTTP à la BDD

### Exemple : Inscription d'un utilisateur

```
1. FRONTEND (auth.js)
   └─► fetch('http://localhost:8080/api/auth/signup', {
         method: 'POST',
         body: JSON.stringify({
           firstName: 'Oscar',
           lastName: 'Nicolas',
           email: 'oscar@test.com',
           password: 'secret123'
         })
       })
            │
            ▼
2. CONTROLLER (AuthController.java)
   └─► @PostMapping("/signup")
       public ResponseEntity<?> register(@RequestBody User user) {
         // user contient les données du JSON
            │
            ▼
3. REPOSITORY (UserRepository)
   └─► userRepository.save(user);
            │
            ▼
4. HIBERNATE (ORM)
   └─► Génère le SQL :
       INSERT INTO users (first_name, last_name, email, password)
       VALUES ('Oscar', 'Nicolas', 'oscar@test.com', 'secret123')
            │
            ▼
5. BASE H2 (slidedb.mv.db)
   └─► Exécute l'INSERT, stocke la ligne, retourne l'ID généré
            │
            ▼
6. RETOUR (sens inverse)
   └─► User saved = { id: 1, firstName: "Oscar", ... }
       → JSON renvoyé au frontend
```

### Diagramme de Séquence

```
┌──────────┐     ┌────────────┐     ┌────────────┐     ┌───────────┐     ┌─────┐
│ Frontend │     │ Controller │     │ Repository │     │ Hibernate │     │ H2  │
└────┬─────┘     └─────┬──────┘     └─────┬──────┘     └─────┬─────┘     └──┬──┘
     │                 │                  │                  │              │
     │  POST /signup   │                  │                  │              │
     │ {email,pass...} │                  │                  │              │
     │────────────────>│                  │                  │              │
     │                 │                  │                  │              │
     │                 │  save(user)      │                  │              │
     │                 │─────────────────>│                  │              │
     │                 │                  │                  │              │
     │                 │                  │  INSERT INTO...  │              │
     │                 │                  │─────────────────>│              │
     │                 │                  │                  │              │
     │                 │                  │                  │  Execute SQL │
     │                 │                  │                  │─────────────>│
     │                 │                  │                  │              │
     │                 │                  │                  │   id = 1     │
     │                 │                  │                  │<─────────────│
     │                 │                  │                  │              │
     │                 │                  │  User(id=1,...)  │              │
     │                 │                  │<─────────────────│              │
     │                 │                  │                  │              │
     │                 │  User saved      │                  │              │
     │                 │<─────────────────│                  │              │
     │                 │                  │                  │              │
     │  JSON Response  │                  │                  │              │
     │  {userId: 1...} │                  │                  │              │
     │<────────────────│                  │                  │              │
```

---

## 7. Configuration Détaillée

### application.properties expliqué

```properties
# === IDENTIFICATION ===
spring.application.name=slideshow-backend

# === CONNEXION H2 ===
# URL de connexion : fichier persistant
spring.datasource.url=jdbc:h2:file:./data/slidedb
# Driver JDBC pour H2
spring.datasource.driverClassName=org.h2.Driver
# Identifiants (par défaut)
spring.datasource.username=sa
spring.datasource.password=

# === JPA / HIBERNATE ===
# update = crée les tables si elles n'existent pas, 
#          ajoute les colonnes manquantes
# Autres options : create, create-drop, validate, none
spring.jpa.hibernate.ddl-auto=update

# Affiche les requêtes SQL dans la console (debug)
spring.jpa.show-sql=true

# === CONSOLE WEB H2 ===
# Active l'interface graphique
spring.h2.console.enabled=true
# URL d'accès : http://localhost:8080/h2-console
spring.h2.console.path=/h2-console
```

### Options de `ddl-auto`

| Valeur | Comportement | Utilisation |
|--------|--------------|-------------|
| `create` | Supprime et recrée les tables à chaque démarrage | Tests |
| `create-drop` | Comme `create` + supprime à l'arrêt | Tests unitaires |
| `update` | ✅ Met à jour le schéma sans perdre les données | **Développement** |
| `validate` | Vérifie le schéma, erreur si différent | Production |
| `none` | Ne fait rien | Production |

### Modes de Connexion H2

| URL | Mode | Persistance |
|-----|------|-------------|
| `jdbc:h2:mem:testdb` | Mémoire | ❌ Perdu à l'arrêt |
| `jdbc:h2:file:./data/slidedb` | Fichier | ✅ **Persistant** |
| `jdbc:h2:tcp://localhost/~/test` | Serveur | ✅ Multi-connexion |

---

## 8. Console H2 - Visualiser les Données

### Accès

1. Démarre le backend : `mvn spring-boot:run`
2. Va sur : http://localhost:8080/h2-console
3. Paramètres de connexion :

| Champ | Valeur |
|-------|--------|
| **JDBC URL** | `jdbc:h2:file:./data/slidedb` |
| **User Name** | `sa` |
| **Password** | *(vide)* |

### Interface

```
┌─────────────────────────────────────────────────────────────┐
│  H2 Console                                                 │
├──────────────────┬──────────────────────────────────────────┤
│                  │                                          │
│  📁 SLIDEDB      │   SELECT * FROM USERS;                   │
│  ├── USERS       │                                          │
│  │   ├── ID      │   ┌────┬───────────┬──────────┬────────┐│
│  │   ├── EMAIL   │   │ ID │ FIRST_NAME│ LAST_NAME│ EMAIL  ││
│  │   └── ...     │   ├────┼───────────┼──────────┼────────┤│
│  └── PROJECTS    │   │ 1  │ Oscar     │ Nicolas  │ osc@.. ││
│      ├── ID      │   │ 2  │ Jules     │ Levecq   │ jul@.. ││
│      └── ...     │   └────┴───────────┴──────────┴────────┘│
│                  │                                          │
└──────────────────┴──────────────────────────────────────────┘
```

### Requêtes Utiles

```sql
-- Voir tous les utilisateurs
SELECT * FROM USERS;

-- Voir tous les projets
SELECT * FROM PROJECTS;

-- Voir les projets d'un utilisateur
SELECT p.* FROM PROJECTS p 
JOIN USERS u ON p.USER_ID = u.ID 
WHERE u.EMAIL = 'oscar@test.com';

-- Compter les projets par utilisateur
SELECT u.FIRST_NAME, COUNT(p.ID) as nb_projets
FROM USERS u
LEFT JOIN PROJECTS p ON u.ID = p.USER_ID
GROUP BY u.ID;

-- Supprimer un utilisateur (attention aux contraintes !)
DELETE FROM PROJECTS WHERE USER_ID = 1;
DELETE FROM USERS WHERE ID = 1;
```

---

## 9. Résumé en une Image

```
┌──────────────────────────────────────────────────────────────────────┐
│                         ARCHITECTURE BDD                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐                                                    │
│  │ Controller  │  ← Reçoit les requêtes HTTP                        │
│  │ (Java)      │    @PostMapping, @GetMapping...                    │
│  └──────┬──────┘                                                    │
│         │ Appelle                                                   │
│         ▼                                                           │
│  ┌─────────────┐                                                    │
│  │ Repository  │  ← Interface avec méthodes CRUD                    │
│  │ (Interface) │    Spring génère l'implémentation                  │
│  │             │    findByEmail() → SELECT WHERE email=?            │
│  └──────┬──────┘                                                    │
│         │ Utilise                                                   │
│         ▼                                                           │
│  ┌─────────────┐                                                    │
│  │  Hibernate  │  ← ORM : convertit Objets ↔ SQL                    │
│  │   (JPA)     │    @Entity User → TABLE users                      │
│  │             │    Gère le cache, les transactions                 │
│  └──────┬──────┘                                                    │
│         │ Exécute SQL                                               │
│         ▼                                                           │
│  ┌─────────────┐                                                    │
│  │     H2      │  ← Base de données relationnelle                   │
│  │  Database   │    Stocke dans slidedb.mv.db                       │
│  │             │    Console : localhost:8080/h2-console             │
│  └─────────────┘                                                    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📎 Questions Fréquentes

### ❓ "Pourquoi H2 plutôt que MySQL ?"

> H2 est **embarqué** (aucune installation), parfait pour le développement et le prototypage rapide. En production, on migrerait vers PostgreSQL ou MySQL en changeant simplement 3 lignes dans `application.properties`.

### ❓ "Comment les données sont-elles persistées ?"

> Le fichier `./data/slidedb.mv.db` contient toutes les données. Grâce à `spring.jpa.hibernate.ddl-auto=update`, les tables sont créées/mises à jour automatiquement au démarrage de l'application.

### ❓ "Pourquoi utiliser JPA plutôt que du SQL direct ?"

> JPA offre :
> - **Abstraction** : on manipule des objets Java, pas du SQL
> - **Portabilité** : le même code fonctionne sur MySQL, PostgreSQL, Oracle...
> - **Productivité** : moins de code à écrire et maintenir
> - **Sécurité** : protection contre les injections SQL

### ❓ "Comment ajouter un nouveau champ à une entité ?"

> 1. Ajouter l'attribut dans la classe Java (ex: `private String role;`)
> 2. Relancer l'application
> 3. Hibernate ajoute automatiquement la colonne (`ddl-auto=update`)

### ❓ "Comment migrer vers MySQL/PostgreSQL ?"

> Modifier `application.properties` :
> ```properties
> # MySQL
> spring.datasource.url=jdbc:mysql://localhost:3306/slidr
> spring.datasource.driverClassName=com.mysql.cj.jdbc.Driver
> spring.datasource.username=root
> spring.datasource.password=motdepasse
> ```
> Et ajouter le driver dans `pom.xml`.

---

*Documentation Base de Données - Slid'R - ISEN 2026*
