import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
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
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const prisma = this;
    return prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await prisma.$transaction([
              prisma.$executeRawUnsafe(
                `SELECT set_config('request.jwt.claims', '{"sub": "${userId}", "role": "authenticated"}', TRUE)`
              ),
              query(args),
            ]);
            return result;
          },
        },
      },
    });
  }
}
