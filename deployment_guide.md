# 🚀 Guide de Déploiement Final (Production)

Ce document vous guide pas à pas pour déployer de manière sécurisée les différentes briques de votre infrastructure (Base de données, API Backend, et Interface Web).

## Étape 1 : Base de données (Supabase)
Avant de lancer les serveurs, la base de données doit être prête et sécurisée.

1. Allez sur votre tableau de bord [Supabase](https://supabase.com).
2. Rendez-vous dans le menu **SQL Editor** (l'icône d'éditeur de code à gauche).
3. Ouvrez le fichier `backend/prisma/rls_policies.sql` que nous avons créé précédemment.
4. Copiez tout le contenu de ce fichier et collez-le dans l'éditeur SQL de Supabase.
5. Cliquez sur **Run** (Exécuter). 
   *👉 Vos tables sont désormais verrouillées et la sécurité RLS est activée.*
6. Allez dans **Project Settings > Database** et copiez la **Connection String (URI)**. Remplacez le mot de passe par le vôtre. Gardez ce lien de côté.

## Étape 2 : L'API Backend (Render)
Maintenant que la base est prête, nous allons déployer le serveur NestJS. Grâce au fichier `render.yaml` que nous avons créé, c'est presque magique.

1. Créez un compte sur [Render.com](https://render.com).
2. Dans le tableau de bord, cliquez sur le bouton **New +** puis sélectionnez **Blueprint**.
3. Connectez votre compte GitHub et sélectionnez le dépôt `Djelis`.
4. Render va détecter automatiquement le fichier `render.yaml`.
5. Remplissez les informations demandées si nécessaire (il va créer un service Web). 
6. Allez dans l'onglet **Environment** du service Web sur Render et ajoutez les variables suivantes :
   - `DATABASE_URL` : Collez l'URL Supabase récupérée à l'Étape 1.
   - `DIRECT_URL` : Même URL que `DATABASE_URL` (utile pour Prisma).
   - `JWT_SECRET` : Générez un mot de passe très long et complexe (ex: `DjeliSecr3t2026!LongEtComplexe`).
7. Cliquez sur **Deploy**.
8. Une fois terminé, copiez l'URL de votre API fournie par Render (ex: `https://djelis-backend.onrender.com`).

## Étape 3 : L'Application Web (Vercel)
Enfin, nous connectons l'interface Web au nouveau serveur sécurisé.

1. Allez sur votre tableau de bord [Vercel](https://vercel.com) et sélectionnez le projet `Djelis`.
2. Allez dans l'onglet **Settings > Environment Variables**.
3. Ajoutez ou modifiez la variable suivante :
   - **Nom** : `NEXT_PUBLIC_API_URL`
   - **Valeur** : Collez l'URL de l'API Render (récupérée à l'Étape 2). Ne mettez pas de `/` à la fin.
4. Ajoutez la variable pour les webhooks Wave (si applicable) :
   - **Nom** : `WAVE_WEBHOOK_SECRET`
   - **Valeur** : Le secret fourni par votre compte marchand Wave.
5. Allez dans l'onglet **Deployments**, cliquez sur les trois petits points du dernier déploiement, et sélectionnez **Redeploy**.
   *👉 C'est obligatoire pour que Next.js intègre la nouvelle URL de l'API.*

---
🎉 **Félicitations !**
Votre plateforme est désormais en ligne, avec une base de données impénétrable, une API robuste, une interface web rapide, et des pipelines CI/CD qui surveilleront chaque future ligne de code.
