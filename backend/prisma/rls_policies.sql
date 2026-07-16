-- ========================================================================================
-- SCRIPT DE MIGRATION SUPABASE RLS (ROW LEVEL SECURITY)
-- Exécutez ce script dans l'éditeur SQL de votre Dashboard Supabase pour sécuriser la base.
-- ========================================================================================

-- 1. ACTIVATION DU RLS SUR TOUTES LES TABLES
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "watch_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "devices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rentals" ENABLE ROW LEVEL SECURITY;

-- 2. FONCTION UTILITAIRE POUR LIRE LE JWT
-- Cette fonction permet de récupérer l'ID injecté par Prisma (via set_config)
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid;
$$ LANGUAGE SQL STABLE;

-- 3. POLITIQUES POUR 'users'
-- Un utilisateur ne peut voir et modifier que sa propre ligne
CREATE POLICY "Users can view own data" ON "users" FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON "users" FOR UPDATE USING (auth.uid() = id);

-- 4. POLITIQUES POUR 'profiles'
-- Un utilisateur ne gère que les profils de son compte
CREATE POLICY "Users can manage their profiles" ON "profiles" 
  FOR ALL USING (auth.uid() = "userId");

-- 5. POLITIQUES POUR 'payments' & 'subscriptions' & 'rentals'
-- Confidentialité financière totale : lecture seule de ses propres transactions
CREATE POLICY "Users can view own payments" ON "payments" 
  FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "Users can view own subscriptions" ON "subscriptions" 
  FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "Users can view own rentals" ON "rentals" 
  FOR SELECT USING (auth.uid() = "userId");

-- 6. POLITIQUES POUR 'watch_history'
CREATE POLICY "Users can manage own watch history" ON "watch_history" 
  FOR ALL USING (
    "profileId" IN (SELECT id FROM "profiles" WHERE "userId" = auth.uid())
  );

-- 7. POLITIQUES POUR 'devices' & 'sessions'
CREATE POLICY "Users can manage own devices" ON "devices" 
  FOR ALL USING (auth.uid() = "userId");
CREATE POLICY "Users can manage own sessions" ON "sessions" 
  FOR ALL USING (auth.uid() = "userId");

-- Note: Les tables "categories", "contents", "episodes" restent publiques en lecture 
-- ou gérées sans RLS pour permettre au catalogue de fonctionner librement pour les visiteurs.
