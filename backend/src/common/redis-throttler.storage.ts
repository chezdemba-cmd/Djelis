import { Logger } from "@nestjs/common";
import type Redis from "ioredis";
import type { ThrottlerStorage } from "@nestjs/throttler";

// `ThrottlerStorageRecord` n'est pas ré-exporté par l'index du package (v6).
interface ThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

const msToSec = (ms: number) => Math.max(0, Math.ceil(ms / 1000));

/**
 * Stockage Redis pour `@nestjs/throttler` v6 — partagé entre toutes les
 * instances serverless (Vercel). Utilisé uniquement si `REDIS_URL` est défini ;
 * sinon le throttler garde son stockage mémoire par défaut.
 *
 * Implémentation volontairement dépendante d'`ioredis` seulement (pas de
 * package tiers) pour éviter les conflits de peer-deps.
 */
export class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly logger = new Logger(RedisThrottlerStorage.name);

  constructor(private readonly redis: Redis) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string
  ): Promise<ThrottlerStorageRecord> {
    try {
      return await this.incrementInRedis(
        key,
        ttl,
        limit,
        blockDuration,
        throttlerName
      );
    } catch (err) {
      // Une panne Redis ne doit jamais mettre l'API entière hors service : on
      // dégrade en laissant passer la requête (fail-open) plutôt que de
      // propager une erreur qui ferait échouer le `ThrottlerGuard` global sur
      // TOUTE route, y compris hors rate-limiting.
      this.logger.warn(
        `Redis indisponible pour le rate-limiting (${throttlerName}), requête autorisée par défaut: ${
          (err as Error)?.message || err
        }`
      );
      return {
        totalHits: 0,
        timeToExpire: msToSec(ttl),
        isBlocked: false,
        timeToBlockExpire: 0,
      };
    }
  }

  private async incrementInRedis(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string
  ): Promise<ThrottlerStorageRecord> {
    const hitKey = `throttle:${throttlerName}:${key}`;
    const blockKey = `${hitKey}:blocked`;

    // Déjà bloqué : on ne compte pas ce hit.
    const blockedPttl = await this.redis.pttl(blockKey);
    if (blockedPttl > 0) {
      const hitPttl = await this.redis.pttl(hitKey);
      return {
        totalHits: limit + 1,
        timeToExpire: msToSec(hitPttl > 0 ? hitPttl : ttl),
        isBlocked: true,
        timeToBlockExpire: msToSec(blockedPttl),
      };
    }

    const totalHits = await this.redis.incr(hitKey);
    if (totalHits === 1) {
      await this.redis.pexpire(hitKey, ttl);
    }
    const hitPttl = await this.redis.pttl(hitKey);
    const timeToExpire = msToSec(hitPttl > 0 ? hitPttl : ttl);

    const isBlocked = totalHits > limit;
    let timeToBlockExpire = 0;
    if (isBlocked) {
      if (blockDuration > 0) {
        await this.redis.set(blockKey, "1", "PX", blockDuration, "NX");
        timeToBlockExpire = msToSec(blockDuration);
      } else {
        timeToBlockExpire = timeToExpire;
      }
    }

    return { totalHits, timeToExpire, isBlocked, timeToBlockExpire };
  }
}
