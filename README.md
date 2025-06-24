# Game Dashboard - Suivi Pédagogique Interactif

![Angular](https://img.shields.io/badge/Angular-19-DD0031?logo=angular&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Realtime_DB-FFCA28?logo=firebase&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-Authentification-FFCA28?logo=firebase&logoColor=black)

Tableau de bord web développé avec Angular 19 et Firebase Realtime Database, conçu pour le suivi des performances des étudiants dans un environnement d'apprentissage ludique des mathématiques. Cette plateforme est destinée aux enseignants, parents et administrateurs, et s'interface avec des jeux éducatifs développés séparément (Unity) et une application mobile de suivi parental.

## Liens des Dépôts de l'Écosystème

| Composant | Description | Lien du Dépôt |
|-----------|-------------|---------------|
| **Dashboard Web** | Interface web pour enseignants et administrateurs | [https://github.com/yassinekamouss/game-dashboard.git](https://github.com/yassinekamouss/game-dashboard.git) |
| **Jeux Unity** | Mini-jeux éducatifs de mathématiques | [https://github.com/JunaidUthman/minigamesV3.git](https://github.com/JunaidUthman/minigamesV3.git) |
| **Application Mobile** | Application de suivi parental | [https://github.com/yassinekamouss/EspaceParental.git](https://github.com/yassinekamouss/EspaceParental.git) |

## Table des Matières

1.  [Objectif du Projet](#objectif-du-projet)
2.  [Architecture de l'Écosystème](#architecture-de-lécosystème)
3.  [Fonctionnalités Principales](#fonctionnalités-principales)
4.  [Stack Technologique](#stack-technologique)
5.  [Prérequis](#prérequis)
6.  [Installation](#installation)
7.  [Configuration de Firebase](#configuration-de-firebase)
8.  [Lancement de l'application](#lancement-de-lapplication)
9.  [Structure du Projet](#structure-du-projet)
10. [Interaction avec les Composants](#interaction-avec-les-composants)
11. [Contribution](#contribution)
12. [Contributeurs](#contributeurs)

## Objectif du Projet

L'objectif principal de ce projet est de fournir un **écosystème complet d'apprentissage ludique** comprenant :

- Une **interface web** intuitive et efficace permettant aux **enseignants** de suivre les progrès individuels et collectifs de leurs élèves, d'identifier les difficultés et d'adapter leurs méthodes pédagogiques.
- Des **jeux éducatifs Unity** engageants pour l'apprentissage des mathématiques.
- Une **application mobile** permettant aux **parents** de suivre les progrès de leurs enfants.
- Des outils pour les **administrateurs** de gérer les utilisateurs et d'obtenir des statistiques globales sur l'utilisation de la plateforme.

## Architecture de l'Écosystème

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Jeux Unity    │    │  Dashboard Web  │    │  App Mobile     │
│  (Mini-jeux)    │    │   (Angular 19)  │    │ (Suivi Parent)  │
│                 │    │                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼───────────┐
                    │    Firebase Ecosystem   │
                    │  • Realtime Database    │
                    │  • Authentication       │
                    │  • Hosting              │
                    └─────────────────────────┘
```

## Fonctionnalités Principales

### Dashboard Web (Ce dépôt)
- **Tableaux de bord personnalisés** : Vues adaptées pour chaque type d'utilisateur (enseignant, admin).
- **Suivi des performances** : Visualisation des scores, temps passé, niveaux atteints, erreurs fréquentes par matière ou par jeu.
- **Gestion des utilisateurs** : Création, modification, suppression des comptes étudiants, enseignants.
- **Gestion des classes et groupes** : Organisation des étudiants pour un suivi facilité.
- **Rapports et statistiques** : Génération de rapports sur les progrès et l'engagement.
- **Interface responsive** : Accessible sur ordinateurs, tablettes et smartphones.

### Jeux Unity
- **Mini-jeux éducatifs** de mathématiques adaptés aux différents niveaux.
- **Collecte automatique** des données de performance (scores, temps, erreurs).
- **Synchronisation** en temps réel avec Firebase.

### Application Mobile Parentale
- **Suivi des progrès** de l'enfant depuis le mobile.
- **Notifications** sur les performances et activités.
- **Interface intuitive** adaptée aux parents.

## Stack Technologique

### Dashboard Web
- **Frontend** : Angular 19 (TypeScript, HTML, SCSS)
- **Backend & Base de données** : Firebase Realtime Database
- **Authentification** : Firebase Authentication
- **Hébergement** : Firebase Hosting

### Jeux Unity
- **Moteur de jeu** : Unity
- **Langage** : C#
- **Base de données** : Firebase Realtime Database
- **Authentification** : Firebase Authentication

### Application Mobile
- **Framework** : [À préciser selon la technologie utilisée]
- **Base de données** : Firebase Realtime Database
- **Authentification** : Firebase Authentication

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants sur votre machine :

- [Node.js](https://nodejs.org/) (version 18.x ou 20.x recommandée)
- [npm](https://www.npmjs.com/) (généralement inclus avec Node.js) ou [Yarn](https://yarnpkg.com/)
- [Angular CLI](https://angular.io/cli) : `npm install -g @angular/cli`
- Un compte [Firebase](https://firebase.google.com/)

## Installation

1.  **Clonez le dépôt :**

    ```bash
    git clone https://github.com/yassinekamouss/game-dashboard.git
    ```

2.  **Accédez au répertoire du projet :**

    ```bash
    cd game-dashboard
    ```

3.  **Installez les dépendances :**
    ```bash
    npm install
    # ou si vous utilisez yarn
    # yarn install
    ```

## Configuration de Firebase

Pour que l'application puisse se connecter à votre instance Firebase, vous devez configurer vos clés d'API.

1.  **Créez un projet Firebase** sur la [console Firebase](https://console.firebase.google.com/).
2.  Dans votre projet Firebase, allez dans **Paramètres du projet** (Project Settings).
3.  Sous l'onglet **Général** (General), descendez jusqu'à la section "Vos applications" (Your apps).
4.  Si vous n'avez pas encore d'application web, cliquez sur l'icône web (</>) pour en ajouter une. Enregistrez l'application.
5.  Firebase vous fournira un objet de configuration. Copiez ces informations.
6.  **Créez les fichiers d'environnement** dans votre projet Angular :

    - `src/environments/environment.ts` (pour le développement)
    - `src/environments/environment.prod.ts` (pour la production)

    Copiez le contenu suivant dans chacun de ces fichiers et remplacez les placeholders par vos propres clés Firebase :

    ```typescript
    // src/environments/environment.ts
    export const environment = {
      production: false,
      firebase: {
        apiKey: "VOTRE_API_KEY",
        authDomain: "VOTRE_AUTH_DOMAIN",
        databaseURL: "VOTRE_DATABASE_URL_REALTIMEDB", // Important pour RealtimeDB
        projectId: "VOTRE_PROJECT_ID",
        storageBucket: "VOTRE_STORAGE_BUCKET",
        messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
        appId: "VOTRE_APP_ID",
        measurementId: "VOTRE_MEASUREMENT_ID", // Optionnel, pour Google Analytics
      },
    };

    // src/environments/environment.prod.ts
    export const environment = {
      production: true,
      firebase: {
        apiKey: "VOTRE_API_KEY_PROD", // Utilisez des clés différentes pour la prod si nécessaire
        authDomain: "VOTRE_AUTH_DOMAIN_PROD",
        databaseURL: "VOTRE_DATABASE_URL_REALTIMEDB_PROD",
        projectId: "VOTRE_PROJECT_ID_PROD",
        storageBucket: "VOTRE_STORAGE_BUCKET_PROD",
        messagingSenderId: "VOTRE_MESSAGING_SENDER_ID_PROD",
        appId: "VOTRE_APP_ID_PROD",
        measurementId: "VOTRE_MEASUREMENT_ID_PROD",
      },
    };
    ```

    **Note importante :** N'oubliez pas d'ajouter `src/environments/environment.ts` à votre fichier `.gitignore` si vous ne souhaitez pas que vos clés de développement soient versionnées.

7.  **Configurez les règles de sécurité** de votre Firebase Realtime Database et Firebase Authentication pour protéger les données de vos utilisateurs.

## Lancement de l'application

- **Pour le développement :**
  Exécutez la commande suivante pour démarrer le serveur de développement Angular :

  ```bash
  ng serve
  # ou
  # npm start
  ```

  Ouvrez votre navigateur et allez sur http://localhost:4200/. L'application se rechargera automatiquement si vous modifiez les fichiers sources.

- **Pour la production (Build) :**
  Exécutez la commande suivante pour compiler l'application pour la production :
  ```bash
  ng build --configuration production
  ```

  Les fichiers compilés seront générés dans le répertoire `dist/game-dashboard`. Vous pourrez ensuite déployer ces fichiers sur un serveur web ou Firebase Hosting.

## Structure du Projet

Une brève description de l'organisation des dossiers principaux :

```bash
GAME-DASHBOARD/
├── .angular/                # Fichiers internes Angular CLI
├── .vscode/                 # Paramètres spécifiques à VS Code
├── node_modules/            # Dépendances installées via npm
├── public/                  # Fichiers publics (assets statiques, etc.)
├── src/                     # Code source principal
│   ├── app/                 # Application principale
│   │   ├── components/      # Composants réutilisables
│   │   ├── environments/    # Fichiers d'environnement (dev/prod)
│   │   ├── factories/       # Fonctions de création/initialisation
│   │   ├── models/          # Interfaces et types TypeScript
│   │   ├── services/        # Services Angular (API, logique métier)
│   │   ├── app.component.*  # Composant racine (CSS, HTML, TS, spec)
│   │   ├── app.config.ts    # Configuration de l'application
│   │   ├── app.routes.ts    # Routes principales
│   │   └── chart.config.ts  # Configuration spécifique aux graphiques
│   ├── assets/              # Fichiers statiques (images, polices, etc.)
│   ├── index.html           # Point d'entrée HTML
│   ├── main.ts              # Point d'entrée TypeScript
│   └── styles.css           # Feuille de styles globale
├── .editorconfig            # Configuration des règles d'édition
├── .gitignore               # Fichiers/dossiers à ignorer par Git
├── angular.json             # Configuration Angular CLI
├── package.json             # Fichier de configuration npm
├── package-lock.json        # Version verrouillée des dépendances
├── README.md                # Documentation du projet
├── tsconfig.app.json        # Config TypeScript pour l'application
├── tsconfig.json            # Config TypeScript principale
└── tsconfig.spec.json       # Config TypeScript pour les tests
```

## Interaction avec les Composants

### Flux de Données

1. **Jeux Unity → Firebase** :
   - Les jeux authentifient l'étudiant via Firebase Authentication
   - Collectent les données de performance (scores, temps, erreurs, progression)
   - Envoient ces données structurées à Firebase Realtime Database

2. **Dashboard Web ↔ Firebase** :
   - Lit les données depuis Firebase Realtime Database
   - Affiche et analyse les performances des étudiants
   - Permet la gestion des utilisateurs et classes

3. **Application Mobile ↔ Firebase** :
   - Synchronise les données de suivi parental
   - Affiche les progrès des enfants
   - Envoie des notifications aux parents

### Structure des Données Firebase

Il est crucial que la structure des données dans Firebase soit cohérente entre tous les composants de l'écosystème. Voici un exemple de structure recommandée :

```json
{
  "users": {
    "userId": {
      "role": "student|teacher|parent|admin",
      "profile": { /* informations utilisateur */ }
    }
  },
  "students": {
    "studentId": {
      "performances": {
        "gameId": {
          "sessions": { /* données de sessions de jeu */ }
        }
      }
    }
  },
  "classes": { /* gestion des classes */ },
  "games": { /* configuration des jeux */ }
}
```

## Contribution

Les contributions sont les bienvenues ! Si vous souhaitez contribuer à l'un des composants de l'écosystème :

1.  Forkez le projet correspondant
2.  Créez votre branche de fonctionnalité (`git checkout -b feature/NouvelleFonctionnalite`)
3.  Commitez vos changements (`git commit -m 'Ajout de NouvelleFonctionnalite'`)
4.  Poussez vers la branche (`git push origin feature/NouvelleFonctionnalite`)
5.  Ouvrez une Pull Request

Veuillez vous assurer que votre code respecte les conventions de style et que les tests (si présents) passent.

## Contributeurs

Merci à toutes les personnes ayant contribué à cet écosystème !

### Dashboard Web
- [Yassine Kamouss](https://github.com/yassinekamouss) – Créateur principal
- [Yahya Ahmane](https://github.com/ahyahya1616) – Contributeur principal

### Jeux Unity
- [Junaid Uthman](https://github.com/JunaidUthman) – Développeur principal des mini-jeux

### Application Mobile
- [Yassine Kamouss](https://github.com/yassinekamouss) – Développeur principal

---

**Liens des Projets :**
- Dashboard Web : [https://github.com/yassinekamouss/game-dashboard](https://github.com/yassinekamouss/game-dashboard)
- Jeux Unity : [https://github.com/JunaidUthman/minigamesV3](https://github.com/JunaidUthman/minigamesV3)  
- Application Mobile : [https://github.com/yassinekamouss/EspaceParental](https://github.com/yassinekamouss/EspaceParental)