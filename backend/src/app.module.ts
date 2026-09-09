import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import Redis from "ioredis";
import { createKeyv } from "@keyv/redis";
import { RedisThrottlerStorage } from "./common/redis-throttler.storage";

// Redis partagé entre instances serverless (rate-limit + cache). Absent =>
// throttler et cache restent en mémoire (comportement actuel). Voir REDIS.md.
const REDIS_URL = process.env.REDIS_URL;
const throttlerStorage = REDIS_URL
  ? new RedisThrottlerStorage(
      new Redis(REDIS_URL, { maxRetriesPerRequest: 3, lazyConnect: false })
    )
  : undefined;
import { AuthModule } from "./auth/auth.module";
import { CatalogModule } from "./catalog/catalog.module";
import { PaymentsModule } from "./payments/payments.module";
import { ProfileModule } from "./profile/profile.module";
import { AdminModule } from "./admin/admin.module";
import { FavoritesModule } from "./favorites/favorites.module";
import { HealthModule } from "./health/health.module";
import { UsersModule } from "./users/users.module";
import { PrismaModule } from "./prisma.module";

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        stores: REDIS_URL ? [createKeyv(REDIS_URL)] : undefined,
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 100 }], // 100 req/min/IP
      storage: throttlerStorage,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "uploads"),
      serveRoot: "/uploads",
    }),
    PrismaModule,
    AuthModule,
    CatalogModule,
    PaymentsModule,
    ProfileModule,
    AdminModule,
    FavoritesModule,
    HealthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
