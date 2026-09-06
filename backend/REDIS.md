# Redis — rate-limiting & cache partagés (à faire quand le trafic le justifie)

## Pourquoi

Aujourd'hui `ThrottlerModule` et `CacheModule` sont **en mémoire**. Sur Vercel
(plusieurs instances serverless, cold starts fréquents) :

- le rate-limiting est réinitialisé à chaque instance → protection faible ;
- le cache `catalog_home_feed` n'est pas partagé, et son invalidation après une
  action admin ne se propage pas aux autres instances (TTL 5 min compense en
  partie).

À faible trafic (lancement / MVP) ce n'est pas bloquant. À faire dès qu'il y a
du volume réel ou des abus.

## Instance Redis

Créer un Redis managé (ex. **Upstash**, offre gratuite, compatible Vercel) et
définir sur le projet backend :

```
REDIS_URL=rediss://default:xxxxx@xxxx.upstash.io:6379
```

## Rate-limiting (`@nestjs/throttler` v6)

```bash
npm i ioredis @nest-lab/throttler-storage-redis
```

`app.module.ts` :

```ts
import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis";
import Redis from "ioredis";

ThrottlerModule.forRoot({
  throttlers: [{ ttl: 60000, limit: 100 }],
  storage: process.env.REDIS_URL
    ? new ThrottlerStorageRedisService(new Redis(process.env.REDIS_URL))
    : undefined, // fallback mémoire si REDIS_URL absent
}),
```

## Cache (`@nestjs/cache-manager` v3 + `cache-manager` v7, API Keyv)

```bash
npm i @keyv/redis keyv
```

```ts
import { createKeyv } from "@keyv/redis";

CacheModule.registerAsync({
  isGlobal: true,
  useFactory: () => ({
    stores: process.env.REDIS_URL ? [createKeyv(process.env.REDIS_URL)] : [],
  }),
}),
```

> ⚠️ `cache-manager-redis-store` présent dans `package.json` est pour l'ancienne
> API (cache-manager v5) et **ne fonctionne pas** avec la v7 installée. À
> remplacer par `@keyv/redis` lors de cette migration.

## Vérification

- `throttler` : dépasser la limite depuis 2 requêtes quasi simultanées et
  confirmer le `429` cohérent.
- `cache` : modifier un contenu dans l'admin, vérifier que `/catalog/home`
  reflète le changement immédiatement sur toutes les instances.
