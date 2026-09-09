# 🚀 Runbook de lancement — Djeli'S

Ce document est la checklist opérationnelle pour mettre en ligne la version de
lancement (**DjeliSon ouvert & gratuit, DjaaSoo « Bientôt disponible »**).

Pour l'infra générale (Supabase / Vercel / Render), voir `deployment_guide.md`.
Pour Redis, voir `backend/REDIS.md`.

---

## 1. Ordre de merge des PR (branches de la session)

Toutes coupées de `main`, sans conflit entre elles (vérifié : les 4 se
mergent proprement en séquence, `nest build` + `next build` + tests OK).

| Ordre | Branche | Effet |
|------:|---------|-------|
| 1 | `feat/launch-mode` | DjaaSoo verrouillé « Bientôt », DjeliSon gratuit, abonnement masqué, page `/register` |
| 2 | `feat/account-verification` | Vérif e-mail/tél à l'inscription + pages `/verify-email`, `/reset-password` (migration) |
| 3 | `feat/redis-throttle-cache` | Rate-limit + cache Redis si `REDIS_URL` (sinon inchangé) |
| 4 | `feat/tvod-rental` | Location à l'acte — **inutile tant que DjaaSoo est fermé**, peut être mergée plus tard |

Après merges : ré-aligner la branche de staging → `git checkout integration/pre-prod && git merge --ff-only main && git push` (ou la supprimer si elle ne sert plus).

Nettoyage : supprimer sur origin les branches déjà mergées (session précédente
+ `fix/upload-direct-supabase`) → `git push origin --delete <nom>`.

---

## 2. Base de données (une seule fois)

```bash
cd backend
# Baseline : la base prod existe déjà (créée avec db push), on marque les
# migrations comme appliquées SANS ré-exécuter le SQL.
DATABASE_URL="<url prod>" npx prisma migrate resolve --applied 0_init
DATABASE_URL="<url prod>" npx prisma migrate resolve --applied 20260904090000_add_content_youtube_id
DATABASE_URL="<url prod>" npx prisma migrate status
```

La migration `20260909120000_account_verification` (colonnes de vérification,
idempotente `ADD COLUMN IF NOT EXISTS`) sera appliquée par `prisma migrate
deploy` au déploiement suivant, ou manuellement dans le SQL Editor Supabase.

Passer le bucket Supabase Storage en **privé** une fois l'upload + la lecture
signée testés. Souscrire **Supabase Pro** avant de charger de vrais films
(limite 50 Mo/fichier en Free).

---

## 3. Variables d'environnement

### Backend (projet Vercel backend)

| Variable | Valeur au lancement | Notes |
|----------|--------------------|-------|
| `DATABASE_URL` / `DIRECT_URL` | pooler transaction / session | Supabase |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | aléatoire ≥ 32 car., identiques partout | |
| `SUPABASE_URL` | `https://snsozwnzlpwfurutatch.supabase.co` | |
| `SUPABASE_SERVICE_ROLE_KEY` | clé **service_role** (pas anon) | |
| `SUPABASE_STORAGE_BUCKET` | `media` | à ajuster si le bucket a un autre nom |
| `APP_URL` | `https://djelis.com` (domaine web réel) | liens e-mail |
| `PUBLIC_API_URL` | URL publique du backend | `notify_url` CinetPay |
| `EXTRA_CORS_ORIGINS` | domaines web additionnels (CSV) | previews Vercel, domaine custom |
| **`LAUNCH_MODE`** | **`true`** | ← retirer le jour de l'ouverture DjaaSoo |
| `RESEND_API_KEY` / `EMAIL_FROM` | vide au début (e-mails journalisés) | à remplir quand le compte Resend est prêt |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM` | vide au début (SMS journalisés) | idem Twilio |
| `WAVE_API_KEY` / `WAVE_WEBHOOK_SECRET` | vide au début | paiement inactif tant que non renseigné |
| `CINETPAY_API_KEY` / `CINETPAY_SITE_ID` / `CINETPAY_SECRET` | vide au début | idem |
| `RENTAL_DURATION_HOURS` | `48` (défaut) | location à l'acte |
| `REDIS_URL` | vide au début | mettre l'URL Upstash quand le trafic monte |
| `NODE_ENV` | `production` | |

Ne **pas** définir en prod : `ENABLE_PAYMENT_SIMULATION`, `AUTH_DEBUG_CODES`.

### Web (projet Vercel web-app)

| Variable | Valeur au lancement |
|----------|--------------------|
| `NEXT_PUBLIC_API_URL` | URL publique du backend, **sans `/` final** |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client navigateur (clé anon) |
| **`NEXT_PUBLIC_LAUNCH_MODE`** | **`true`** | ← à retirer en même temps que `LAUNCH_MODE` backend |

> ⚠️ Les `NEXT_PUBLIC_*` sont inlinées **au build** : après toute
> modification, **redéployer** le projet web.

---

## 4. Validation avant ouverture au public

- [ ] Preview Vercel : cold start OK, `GET /health` répond.
- [ ] Inscription via `/register` → compte créé, connexion, profil.
- [ ] DjeliSon : lecture d'un contenu audio sans blocage d'abonnement.
- [ ] DjaaSoo : affiche l'écran « Bientôt disponible », `/api/v1/stream/token`
      sur une vidéo renvoie 403.
- [ ] Aucun bouton « S'abonner » / « Abonnements & Tarifs » visible.
- [ ] (quand clés Resend/Twilio posées) « mot de passe oublié » envoie l'e-mail,
      le lien `/reset-password` fonctionne ; OTP SMS reçu.
- [ ] (quand clés passerelles posées) **valider les signatures webhooks contre
      un sandbox Wave et CinetPay** avant d'accepter de vrais paiements
      (schémas implémentés d'après la doc, jamais testés en conditions réelles).

---

## 5. Jour de l'ouverture de DjaaSoo

1. Charger le catalogue vidéo (films, séries, théâtre) via le back-office, en
   `isActive` + `publishedAt`, `rentalPriceFcfa` si location souhaitée.
2. Mettre en place l'abonnement (plans, activation des passerelles).
3. Retirer `LAUNCH_MODE` (backend) **et** `NEXT_PUBLIC_LAUNCH_MODE` (web).
4. Merger `feat/tvod-rental` si la location à l'acte est voulue.
5. Redéployer les deux projets Vercel.
