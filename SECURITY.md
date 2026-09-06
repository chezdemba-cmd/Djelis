# Sécurité — rotation des secrets

## Contexte (à traiter avant toute mise en production)

Des secrets **réels** ont été committés dans l'historique Git puis retirés :

- commit `fd48aac` : ajout de `backend/.env.vercel.prod` contenant `JWT_SECRET`,
  `JWT_REFRESH_SECRET`, `DATABASE_URL` (avec le mot de passe Postgres Supabase),
  `DIRECT_URL`, ainsi que `.env.vercel` et `backend/.env.vercel`.
- commit `2c6d0e3` : suppression de ces fichiers.
- commit `bae6bc3` : suppression de credentials dans des scripts de test.

Le retrait d'un fichier **ne retire pas son contenu de l'historique**. Tout
clone du dépôt contient encore ces valeurs. De plus, le fichier de travail
`.env.vercel` (non suivi) contient une clé Supabase `service_role` valide
plusieurs années.

**Conclusion : tous les secrets ci-dessous doivent être considérés comme
compromis et remplacés avant le lancement.**

## Checklist de rotation

- [ ] **Mot de passe base Postgres (Supabase)** — Dashboard Supabase →
      *Project Settings → Database → Reset database password*. Mettre à jour
      `DATABASE_URL` et `DIRECT_URL` sur Vercel (projet backend) et, le cas
      échéant, sur Render.
- [ ] **Clé `service_role` Supabase** — *Project Settings → API → Rotate
      `service_role` secret*. Mettre à jour `SUPABASE_SERVICE_ROLE_KEY`.
      Vérifier qu'aucune clé `service_role` n'est présente dans un fichier
      versionné ni dans un bundle front.
- [ ] **Clé `anon` Supabase** — la roter également (elle est publique par
      design mais a pu être associée à des politiques ; la régénérer coupe les
      accès basés sur l'ancienne).
- [ ] **`JWT_SECRET` / `JWT_REFRESH_SECRET`** — générer de nouvelles valeurs
      (`openssl rand -hex 32`), les poser sur **tous** les backends. Effet de
      bord attendu : toutes les sessions et tous les refresh tokens existants
      deviennent invalides (déconnexion générale). À faire pendant une fenêtre
      de faible trafic.
- [ ] **Secrets webhooks paiement** (`WAVE_WEBHOOK_SECRET`, `CINETPAY_SECRET`)
      — les régénérer côté espace marchand Wave / CinetPay et les reposer.
- [ ] **Clé privée Cloudflare Stream** (`CLOUDFLARE_PRIVATE_KEY`,
      `CLOUDFLARE_KEY_ID`) — régénérer si elle a transité par un canal non sûr.
- [ ] **Token OIDC Vercel** présent dans `.env.vercel` — non réutilisable
      hors CI Vercel, mais retirer le fichier du disque.

## Nettoyage du dépôt

- [ ] Supprimer du disque : `.env.vercel`, `backend/.env.vercel`,
      `backend/.env.vercel.prod`, `web-app/.env.vercel`,
      `web-app/.env.vercel.prod` (non suivis mais présents localement).
- [ ] Décider si l'historique Git doit être réécrit (`git filter-repo` /
      BFG) pour purger les valeurs. Si le dépôt a été poussé sur un remote
      partagé, la réécriture impose un `push --force` coordonné et
      l'invalidation des clones existants. À défaut de réécriture, la rotation
      ci-dessus reste indispensable et suffisante.
- [ ] Activer la détection de secrets sur le remote (GitHub secret scanning /
      push protection).

## Prévention

- `backend/.gitignore` et les `.gitignore` racine ignorent désormais
  `.env`, `.env.*` (sauf `.env.example`) et `*.env`.
- La CI exécute un scan `gitleaks` sur chaque push / PR (voir
  `.github/workflows/ci.yml`).
- Modèles de configuration sans valeurs : `backend/.env.example`,
  `mobile/.env.example`, `web-app/.env.local.example`.
