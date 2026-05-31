interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class SimpleCache {
  private store = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

// Singleton cache instance for server-side use
export const cache = new SimpleCache();

// TTL constants (seconds)
export const TTL = {
  FIXTURES: 10 * 60,         // 10 minutes
  LIVE_FIXTURES: 60,          // 1 minute
  TEAM_STATS: 6 * 60 * 60,   // 6 hours
  H2H: 24 * 60 * 60,         // 24 hours
  ODDS: 15 * 60,             // 15 minutes
  AI_ANALYSIS: 2 * 60 * 60,  // 2 hours
  AI_PARLEY: 30 * 60,        // 30 minutes
  FINISHED_MATCH: 7 * 24 * 60 * 60, // 7 days
} as const;
