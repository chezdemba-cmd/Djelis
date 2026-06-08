# Documentation Projet : Djeli'S

Ce fichier sert de référence pour comprendre l'architecture, le fonctionnement et la structure du projet **Djeli'S**, une plateforme de streaming audio et vidéo (vidéos, cinéma, musique, podcasts, contes) ciblant l'Afrique de l'Ouest et sa diaspora.

---

## 📋 1. Présentation Générale

**Djeli'S** est divisé en deux grandes sections de contenus :
1. **DjaaSoo** : Dédié à la vidéo (films, séries, pièces de théâtre, humour et documentaires).
2. **DjeliSon** : Dédié à l'audio (musique, contes traditionnels, récits de griots et podcasts).

L'écosystème comprend :
* Un **backend NestJS** connecté à une base de données **PostgreSQL** via **Prisma**.
* Une **application mobile Flutter** structurée selon le Clean Architecture pattern avec gestion d'état BLoC.
* Un **simulateur Web interactif** autonome (`web-demo`) utilisé pour démontrer l'expérience utilisateur sur différents appareils (Mobile, Ordinateur, Télévision).

---

## 🛠️ 2. Technologies Utilisées

### Backend (API)
* **Framework** : NestJS (Node.js)
* **Base de données** : PostgreSQL
* **ORM** : Prisma
* **Sécurité & Authentification** : Passport.js, JWT (JSON Web Tokens), bcryptjs
* **Validation** : class-validator, class-transformer

### Mobile
* **Langage & Framework** : Dart & Flutter
* **Gestion d'état** : BLoC (Business Logic Component)
* **Client HTTP** : Dio (avec interceptors pour l'injection et le rafraîchissement des tokens)
* **Stockage Sécurisé** : flutter_secure_storage

### Simulateur Web
* HTML5 / CSS3 (Vanilla CSS moderne avec variables et responsive design)
* Vanilla JavaScript (gestion autonome de la navigation spatiale TV, mode hors-ligne et simulateur d'abonnements)

---

## 📁 3. Structure des Fichiers

Le projet est un monorepo structuré comme suit :

```text
Djeli'S/
├── backend/                       # API Backend NestJS
│   ├── prisma/
│   │   ├── schema.prisma          # Schéma de base de données PostgreSQL
│   │   └── seed.ts                # Données initiales (Admins, Catégories, Offres, Vidéos)
│   ├── src/
│   │   ├── auth/                  # Module d'authentification (Connexion, Inscription, Refresh JWT)
│   │   ├── catalog/               # Module catalogue (Flux d'accueil, recherche, streaming)
│   │   ├── payments/              # Module des formules d'abonnements et transactions
│   │   ├── app.module.ts          # Module racine de l'API
│   │   ├── main.ts                # Point d'entrée (Port, CORS, validation globale)
│   │   └── prisma.service.ts      # Service de connexion Prisma Client
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/                        # Application mobile Flutter
│   ├── lib/
│   │   ├── core/                  # Code partagé (Réseau, Router, Thème, Stockage local)
│   │   │   ├── network/api_client.dart  # Client Dio configuré vers /api/v1
│   │   │   └── storage/secure_storage_service.dart
│   │   └── features/              # Modules fonctionnels
│   │       ├── auth/              # Logique d'authentification (Repository, BLoC, Écrans)
│   │       ├── catalog/           # Logique d'affichage des médias (Films, Séries, Player)
│   │       └── subscription/      # Logique de gestion des formules d'abonnements
│   ├── pubspec.yaml               # Dépendances Flutter
│   └── README.md
│
├── web-demo/                      # Simulateur Web interactif (déployé sur Vercel)
│   ├── assets/                    # Logos et affiches de films
│   ├── app.js                     # Logique interactive et navigation spatiale TV
│   ├── index.html                 # Interface principale du simulateur
│   └── style.css                  # Design system CSS du simulateur
│
├── vercel.json                    # Configuration de routage Vercel pour web-demo
└── gemini.md                      # Ce fichier de documentation
```

---

## 🚀 4. Fonctionnalités Implémentées

### Authentification & Profils
* **Inscription/Connexion** : Prise en charge des connexions par E-mail ou par Téléphone (format international E.164).
* **JWT sécurisé** : Double système avec Access Token (durée courte de 15 min) et Refresh Token (30 jours) géré par interceptor côté mobile.
* **Profils multiples** : Possibilité de créer des profils (ex: Profil Enfant) sous un même compte utilisateur.

### Catalogue & Streaming
* **Double Support Linguistique** : Les endpoints de catalogue acceptent les variantes `/catalog/...` et `/catalogue/...`.
* **Flux personnalisé (Featured)** : Flux d'accueil contenant un média mis en avant (Hero) et des lignes thématiques (Cinéma, Théâtre, Documentaires, Audio).
* **Signatures de flux** : Endpoint de sécurisation simulant la signature de flux sécurisés Cloudflare Stream (`/stream/token`).
* **Suivi de lecture** : Enregistrement de la progression de lecture en temps réel (`/stream/progress`) dans la table `WatchHistory`.

### Abonnements & Passerelles Locales
* **Plans d'offres** : Endpoint `/plans` listant les forfaits disponibles (Jour, Week-end, Mois) avec conversion automatique de devise (FCFA pour le Mobile Money, Euros pour la diaspora).
* **Paiements mobiles** : Intégration simulée des passerelles **Wave**, **CinetPay** (Orange/MTN/Moov Money) et **Stripe** (Diaspora).
* **Webhooks sécurisés** : Écoute et traitement automatique des notifications de paiement pour valider les transactions et activer les abonnements.

---

## 🎨 5. Décisions de Design & Architecture

1. **Monorepo Coordonné** : L'API et l'application mobile partagent un contrat unifié. Pour éviter de casser le typage du client mobile lors des audits, le backend effectue un mappage à la volée (via `mapContentToMobile`) pour convertir les clés de base de données (ex: `thumbnailUrl` converti en `poster_url`, `plan.id` numérique converti en `string`).
2. **Double préfixe d'API** : Pour assurer la compatibilité avec tous les clients, le routage accepte à la fois les écritures singulières/plurielles (`/payment` et `/payments`) et orthographes locales (`/catalog` et `/catalogue`).
3. **Sécurité par Environnement** : Pas de secret JWT codé en dur en production. L'application backend lève une exception bloquante au démarrage si le fichier `.env` est mal configuré.

---

## 🤖 6. Instructions pour les Futures IA (Consignes de Maintenance)

Si vous devez modifier ce projet, veuillez respecter les règles de conception suivantes :

### Alignement des Contrats d'API (Crucial)
* Le client Flutter utilise le format **Snake Case** pour la désérialisation JSON. Si vous modifiez les tables Prisma, veillez à adapter la méthode `mapContentToMobile` dans [catalog.service.ts](file:///c:/Users/chezd/Desktop/Antigravity/DjaaSoo/Djeli'S/backend/src/catalog/catalog.service.ts) pour ne pas casser le mobile.
* **Structure du Login** : Le mobile Flutter exige absolument un bloc `user` complet lors de la connexion. Si vous mettez à jour `generateUserTokens()` dans [auth.service.ts](file:///c:/Users/chezd/Desktop/Antigravity/DjaaSoo/Djeli'S/backend/src/auth/auth.service.ts), veillez à conserver le format structuré `user: { id, email, phone, profile: { display_name, avatar_url }, has_active_subscription }`.

### Rapprochement des Paiements (Webhooks)
* N'effectuez jamais de recherche de paiement en base de données par `payment.id` directement avec le paramètre de webhook sans vérification. Le champ `payment.id` est un **UUID** PostgreSQL. Si la passerelle renvoie un ID de session propriétaire (qui n'est pas un UUID), la requête va planter. Utilisez la vérification regex présente dans [payments.service.ts](file:///c:/Users/chezd/Desktop/Antigravity/DjaaSoo/Djeli'S/backend/src/payments/payments.service.ts) pour basculer la recherche sur `gatewayTransactionId` si nécessaire.

### Exécution sur Windows / PowerShell
* Sur la machine de l'utilisateur, l'exécution des scripts PowerShell (`npm.ps1`) est bloquée par la politique système. Pour exécuter ou installer des dépendances, utilisez toujours le préfixe `cmd.exe /c` (ex: `cmd.exe /c npm run build` ou `cmd.exe /c npm install`).
