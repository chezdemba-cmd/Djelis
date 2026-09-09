-- AlterTable
-- Idempotent : applicable manuellement (SQL Editor Supabase) ou via
-- `prisma migrate deploy` sans conflit si les colonnes existent déjà.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phoneVerifiedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerificationTokenHash" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerificationExpiresAt" TIMESTAMP(3);
