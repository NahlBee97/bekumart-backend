// Simple in-memory TTL cache used to replace the external Redis/Upstash
// dependency. It exposes the same minimal get/setex shape the services in
// this codebase were already using, so no call sites beyond the import
// needed to change.
//
// NOTE: this cache lives in the Node process's memory. It resets on every
// restart/deploy and is NOT shared across multiple server instances. That
// is fine here because it only caches read-mostly RajaOngkir lookup data
// (provinces/cities/districts/sub-districts/shipping costs) that is cheap
// to refetch - if you later run multiple instances behind a load balancer
// and want a shared cache, swap this back for Redis (or a hosted
// alternative) using the same get/setex interface.

interface CacheEntry {
  value: string;
  expiresAt: number;
}

class InMemoryCache {
  private store = new Map<string, CacheEntry>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  // Mirrors ioredis' setex(key, ttlSeconds, value) signature.
  async setex(key: string, ttlSeconds: number, value: string): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }
}

export const cache = new InMemoryCache();
