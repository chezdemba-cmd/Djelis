import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    // Une fonction Vercel doit pouvoir terminer son cold start même si la base
    // est momentanément indisponible. Prisma ouvrira la connexion à la
    // première requête réelle ; /health/live reste ainsi une vraie liveness
    // probe, indépendante des services externes.
    if (!process.env.VERCEL) {
      await this.$connect();
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Returns a Prisma Client extended with a transaction that sets PostgreSQL
   * local config 'request.jwt.claims', mimicking Supabase Auth context.
   * This forces RLS policies to evaluate the user's ID.
   */
  withUser(userId: string) {
    if (!UUID_RE.test(userId)) {
      throw new InternalServerErrorException(
        "Identifiant utilisateur invalide pour le contexte RLS."
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const prisma = this;
    // Valeur passée en paramètre lié ($1), jamais interpolée dans le SQL.
    const claims = JSON.stringify({ sub: userId, role: "authenticated" });
    return prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await prisma.$transaction([
              prisma.$executeRaw`SELECT set_config('request.jwt.claims', ${claims}, TRUE)`,
              query(args),
            ]);
            return result;
          },
        },
      },
    });
  }
}
