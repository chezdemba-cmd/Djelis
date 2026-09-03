-- AlterTable
-- Idempotent : peut être appliqué manuellement (SQL Editor Supabase) ou via
-- `prisma migrate deploy` sans conflit si la colonne existe déjà.
ALTER TABLE "contents" ADD COLUMN IF NOT EXISTS "youtubeId" TEXT;
