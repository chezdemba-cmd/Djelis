import { RedisThrottlerStorage } from "./redis-throttler.storage";

/** Faux ioredis minimal, avec TTL simulé par horloge contrôlée. */
class FakeRedis {
  now = 0;
  private store = new Map<string, { val: number | string; expireAt?: number }>();

  private live(key: string) {
    const e = this.store.get(key);
    if (!e) return undefined;
    if (e.expireAt !== undefined && e.expireAt <= this.now) {
      this.store.delete(key);
      return undefined;
    }
    return e;
  }

  async incr(key: string) {
    const e = this.live(key);
    const next = (e ? Number(e.val) : 0) + 1;
    this.store.set(key, { val: next, expireAt: e?.expireAt });
    return next;
  }

  async pexpire(key: string, ms: number) {
    const e = this.live(key);
    if (!e) return 0;
    e.expireAt = this.now + ms;
    return 1;
  }

  async pttl(key: string) {
    const e = this.live(key);
    if (!e) return -2;
    if (e.expireAt === undefined) return -1;
    return e.expireAt - this.now;
  }

  async set(key: string, val: string, _px: "PX", ms: number, _nx: "NX") {
    if (this.live(key)) return null;
    this.store.set(key, { val, expireAt: this.now + ms });
    return "OK";
  }
}

describe("RedisThrottlerStorage", () => {
  let redis: FakeRedis;
  let storage: RedisThrottlerStorage;

  beforeEach(() => {
    redis = new FakeRedis();
    storage = new RedisThrottlerStorage(redis as any);
  });

  it("compte les hits et pose le TTL au premier appel", async () => {
    const r1 = await storage.increment("ip1", 60000, 3, 0, "def");
    expect(r1.totalHits).toBe(1);
    expect(r1.isBlocked).toBe(false);
    expect(r1.timeToExpire).toBe(60);

    redis.now += 10000;
    const r2 = await storage.increment("ip1", 60000, 3, 0, "def");
    expect(r2.totalHits).toBe(2);
    expect(r2.timeToExpire).toBe(50); // le TTL initial ne se réarme pas
  });

  it("passe isBlocked quand la limite est dépassée", async () => {
    await storage.increment("ip2", 60000, 2, 0, "def");
    await storage.increment("ip2", 60000, 2, 0, "def");
    const r3 = await storage.increment("ip2", 60000, 2, 0, "def");
    expect(r3.totalHits).toBe(3);
    expect(r3.isBlocked).toBe(true);
    expect(r3.timeToBlockExpire).toBe(r3.timeToExpire);
  });

  it("respecte blockDuration et ne compte plus pendant le blocage", async () => {
    await storage.increment("ip3", 60000, 1, 30000, "def");
    const blocked = await storage.increment("ip3", 60000, 1, 30000, "def");
    expect(blocked.isBlocked).toBe(true);
    expect(blocked.timeToBlockExpire).toBe(30);

    const during = await storage.increment("ip3", 60000, 1, 30000, "def");
    expect(during.isBlocked).toBe(true);
    expect(during.totalHits).toBe(2); // limit + 1, pas d'incrément réel

    redis.now += 31000;
    const after = await storage.increment("ip3", 60000, 1, 30000, "def");
    expect(after.isBlocked).toBe(true); // hitKey encore vivant (compteur=3 > 1)
    expect(after.totalHits).toBe(3);
  });

  it("réinitialise après expiration de la fenêtre", async () => {
    await storage.increment("ip4", 1000, 5, 0, "def");
    redis.now += 1500;
    const r = await storage.increment("ip4", 1000, 5, 0, "def");
    expect(r.totalHits).toBe(1);
  });

  it("isole les throttlers par nom", async () => {
    await storage.increment("ipx", 60000, 5, 0, "a");
    const b = await storage.increment("ipx", 60000, 5, 0, "b");
    expect(b.totalHits).toBe(1);
  });
});
