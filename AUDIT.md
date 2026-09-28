# 🔍 Audit de production — Djeli'S

Document vivant : reprend le verdict de l'audit initial, puis journalise
chaque écart important découvert **après** l'audit (documentation vs
réalité déployée, config manquante, comportement en prod différent du
comportement attendu). Objectif : ne pas redécouvrir le même type de
problème plusieurs fois, et garder une vue d'ensemble de ce qui reste
fragile entre deux audits complets.

Pour la checklist de lancement, voir `LAUNCH.md`. Pour la sécurité des
secrets, voir `SECURITY.md`.

---

## Audit complet — 2026-09-28

**Verdict** : 🟡 GO CONDITIONNEL — Score 56/100.

**P0 identifiés et corrigés le jour même** :
- RCE critique `next@16.2.10` (CVSS 9.0) → montée vers `16.3.6`.
- Panneau admin exposé côté client à tout utilisateur connecté (le backend,
  lui, rejetait déjà correctement — pas de faille réelle, juste une UI
  trompeuse) → gardé par rôle (`isAdmin`) partout (`ProfileScreen`,
  `MobileDrawer`, `Navbar`, `/admin`).
- Statut de rotation des secrets historiquement compromis (`SECURITY.md`)
  → **toujours non confirmé**, reste à faire côté Supabase/Vercel.

**P1 identifiés et corrigés le jour même** :
- Bouton "Supprimer mon compte" (web) factice → appelle réellement
  `DELETE /api/v1/users/me`.
- Throttler Redis qui ferait tomber toute l'API en 500 en cas de panne
  Redis → fail-open avec log d'avertissement.
- `deployment_guide.md` décrivait un déploiement Render jamais utilisé en
  réalité (le backend tourne sur Vercel serverless) → doc corrigée.
- RLS Supabase présentée comme "active" alors qu'elle est décorative (le
  rôle `postgres` utilisé pour `DATABASE_URL` bypasse RLS par défaut,
  vérifié empiriquement) → doc corrigée, RLS reste décorative en l'état
  (décision d'architecture non tranchée : soit l'activer pour de vrai avec
  un rôle dédié + `FORCE ROW LEVEL SECURITY`, soit assumer que l'autorisation
  reste 100% applicative — ce qui fonctionne aujourd'hui).

**P1/P2 encore ouverts** (non corrigés, nécessitent une décision produit ou
un chantier plus large) :
- Aucun outil de suivi d'erreurs côté backend (pas de Sentry ni équivalent).
- Zéro test automatisé côté frontend web.
- Flux d'abonnement SVOD (web) : UI présente mais non branchée à une vraie
  API de paiement — mock uniquement.
- Pagination catalogue (`limit` côté client) non plafonnée avant `take:`
  Prisma.
- Pas de verrou `SELECT FOR UPDATE` sur la confirmation de paiement
  (risque de double-traitement en cas de double webhook — faible probabilité,
  jamais testé en conditions réelles faute de sandbox Wave/CinetPay).

---

## Écarts découverts après l'audit

Format : date · gravité · description · statut.

### 2026-09-28 — P0 — `NEXT_PUBLIC_LAUNCH_MODE` absent en production (web-app)

`LAUNCH.md` documentait cette variable comme obligatoire côté web, mais
elle n'existait tout simplement pas dans les Environment Variables du
projet Vercel **web-app** (confirmé par capture d'écran du dashboard —
seules `JWT_SECRET`, `NEXT_PUBLIC_SUPABASE_*` et `NEXT_PUBLIC_API_URL`
étaient présentes). Le backend, lui, appliquait bien son propre
`LAUNCH_MODE` et filtrait tout contenu vidéo.

**Conséquence concrète observée** : le site web affichait l'interface
DjaaSoo "ouverte" (onglets Cinéma/Théâtre/Documentaires, badge rouge
"VOD" au lieu de "SOON", pas de cadenas) mais chaque catégorie était
vide — le backend renvoyait un catalogue vidéo vide sans que le front
sache qu'il devait afficher l'écran "Bientôt disponible" à la place.
Repéré par l'utilisateur en testant l'app sur téléphone, pas par un
outil de surveillance.

**Comment ça a été confirmé** : le badge "VOD" vs "SOON" dans
`BottomNav.js:29` (`badge: LAUNCH_MODE ? "SOON" : "VOD"`) dépend
uniquement de cette variable — sa présence dans le screenshot suffisait
à prouver la valeur runtime, sans avoir besoin d'accéder au dashboard.

**Statut** : ✅ résolu le 28/09/2026 — variable ajoutée en type Config
(pas Secret, sur avertissement Vercel) sur le projet web-app, redéployée
sans cache, vérifié en production que `/djaasoo` affiche bien l'écran
verrouillé.

**Pourquoi ça a été raté à l'audit initial** : l'audit du 28/09 a vérifié
le *code* (la logique `LAUNCH_MODE` est correcte et appliquée partout où
il faut, côté backend ET frontend) mais pas la *config déployée
réellement* sur Vercel — aucun accès au dashboard n'était disponible
pendant l'audit. Levier à prévoir pour la prochaine fois : demander un
export ou une capture des Environment Variables des deux projets Vercel
(`backend`, `web-app`) systématiquement, plutôt que de supposer que la
documentation (`LAUNCH.md`) reflète l'état réel.

---

## Comment utiliser ce document

Quand un écart important est découvert (config manquante, comportement
en prod différent de ce que le code/la doc laisse penser, régression après
déploiement) :
1. Ajouter une entrée sous "Écarts découverts après l'audit" avec la date,
   la gravité (P0/P1/P2), ce qui a été observé, comment ça a été confirmé,
   le statut, et — si pertinent — pourquoi l'audit initial ne l'avait pas
   attrapé (pour ajuster la méthode la prochaine fois).
2. Si l'écart change le verdict global ou un score de domaine de l'audit
   initial, le noter explicitement en tête de section.
3. Ne pas supprimer les entrées résolues — juste mettre à jour leur statut
   ("résolu le JJ/MM"), pour garder l'historique des angles morts déjà
   couverts.
