import { LRUCache } from 'lru-cache';

export const XERO_CACHE_TTL = {
  short: 5 * 60 * 1000, // volatile reads: projects, employees, draft pay runs
  long: 60 * 60 * 1000 // immutable/slow-moving reads: posted payslips, settings
} as const;

// Values are wrapped so `undefined`/`null` fetcher results are still cacheable.
const store = new LRUCache<string, { value: unknown }>({
  max: 1000,
  ttl: XERO_CACHE_TTL.short
});

export const xeroCached = async <T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> => {
  const hit = store.get(key);

  if (hit) {
    return hit.value as T;
  }

  const value = await fetcher();
  store.set(key, { value }, { ttl: ttlMs });

  return value;
};

export const invalidateXeroCache = (prefix?: string) => {
  for (const key of [...store.keys()]) {
    if (!prefix || key.startsWith(prefix)) {
      store.delete(key);
    }
  }
};
