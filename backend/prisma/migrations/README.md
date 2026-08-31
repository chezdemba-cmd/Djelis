# Migrations Prisma

Le schéma est désormais géré par **migrations versionnées** (fini `prisma db push`
en production).

## Base de données de PRODUCTION déjà existante (Supabase)

La base actuelle a été créée avec `db push` : les tables existent déjà mais
Prisma n'a aucun historique de migration. Il faut **baseliner une seule fois** :

```bash
cd backend
# Marque la migration initiale comme "déjà appliquée" SANS ré-exécuter le SQL
npx prisma migrate resolve --applied 0_init
# Vérifie
npx prisma migrate status
```

⚠️ À ne faire qu'une fois, et uniquement si les 18 tables existent déjà.
Sur une base vide, ne rien faire : `migrate deploy` créera tout.

## Déploiements suivants

- **Render** (Docker) : automatique — le `CMD` du Dockerfile lance
  `prisma migrate deploy` avant de démarrer l'API.
- **Vercel** (serverless) : le build serverless ne doit pas toucher la base.
  Lancer les migrations dans une étape séparée avant/après le déploiement :

  ```bash
  cd backend && DATABASE_URL="<url prod>" npm run prisma:migrate:deploy
  ```

  (ou une étape dédiée dans un workflow GitHub Actions de release).
- **CI** : `prisma migrate deploy` s'exécute sur une base jetable à chaque run.

## Créer une nouvelle migration (développement)

```bash
cd backend
npx prisma migrate dev --name description_du_changement
```

Committer le dossier `prisma/migrations/<timestamp>_description_du_changement/`
généré.
