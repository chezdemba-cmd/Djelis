# Djeli’S — Plateforme de Streaming Ouest-Africaine
> **Slogan** : *Racines. Récits. Réalité.*

Ce dépôt contient l'amorçage technique et l'architecture logicielle de la plateforme **Djeli'S**, divisée en deux couches principales :
1. **🎬 DjaaSoo** (Vidéo & Cinéma)
2. **🎵 DjeliSon** (Audio & Musique)

---

## Structure du Projet

```
├── backend/                  # API NestJS (Node.js & TypeScript)
│   ├── prisma/               # Schéma de base de données PostgreSQL (Prisma)
│   ├── src/                  # Code source (Auth, Catalogue, Paiements)
│   └── docker-compose.yml    # Infrastructure locale (PostgreSQL + Redis)
│
└── mobile/                   # Application Mobile (Flutter)
    ├── lib/                  # Code source (Clean Architecture)
    │   ├── core/             # Thèmes graphiques, Routage
    │   └── features/         # Fonctionnalités (Auth, DjaaSoo & DjeliSon)
    └── pubspec.yaml          # Modules et dépendances Flutter
```

---

## Démarrage Rapide

### 1. Lancement du Backend (`backend/`)

#### Prérequis :
- **Node.js** (v18+)
- **Docker & Docker Compose**

#### Étapes :
1. Déplacez-vous dans le dossier backend :
   ```bash
   cd backend
   ```
2. Lancez la base de données PostgreSQL et le cache Redis avec Docker :
   ```bash
   docker compose up -d
   ```
3. Créez un fichier `.env` à la racine de `backend/` en y insérant :
   ```env
   DATABASE_URL="postgresql://djelis_admin:djelis_secure_password@localhost:5432/djelis_db?schema=public"
   JWT_SECRET="votre_cle_secrete_jwt_super_securisee"
   JWT_REFRESH_SECRET="votre_cle_secrete_refresh_jwt"
   ```
4. Installez les dépendances et générez le client de base de données Prisma :
   ```bash
   npm install
   npx prisma db push
   ```
5. Lancez le serveur en mode développement :
   ```bash
   npm run start:dev
   ```
L'API sera disponible sur : `http://localhost:3000/api/v1`

---

### 2. Lancement de l'Application Mobile (`mobile/`)

#### Prérequis :
- **Flutter SDK** (v3.0+)
- Un émulateur Android/iOS ou un terminal physique connecté.

#### Étapes :
1. Déplacez-vous dans le dossier mobile :
   ```bash
   cd mobile
   ```
2. Récupérez les packages de dépendances :
   ```bash
   flutter pub get
   ```
3. Exécutez l'application :
   ```bash
   flutter run
   ```

---

## Caractéristiques Clés Implémentées dans le Squelette

* **Architecture Hybride & Double Entrée** : L'accueil mobile intègre deux onglets majeurs segmentant la vidéo (**DjaaSoo**) et l'audio (**DjeliSon**) reliés à un même backend.
* **Modèle SQL Prisma Complet** : Schéma PostgreSQL intégrant la gestion des profils multiples, des restrictions géographiques (droits), des abonnements, des paiements (Mobile Money & Stripe) et du contrôle de partage de compte.
* **Sécurité & Data Saver** : Routes d'authentification par email sécurisées et prêtes pour la validation de numéro (MoMo OTP) différée, configuration de thèmes sombres natifs adaptés aux économies de batteries OLED des téléphones cibles.
