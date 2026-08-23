/**
 * Cache utility for client-side data caching
 * Supports: in-memory cache + localStorage persistence
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // time to live in milliseconds
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

// In-memory cache (session-level, cleared on page refresh)
const memoryCache = new Map<string, CacheEntry<unknown>>();

/**
 * Get data from cache (memory first, then localStorage)
 */
export function getFromCache<T>(key: string): T | null {
  // 1. Check memory cache first
  const memEntry = memoryCache.get(key);
  if (memEntry) {
    if (Date.now() - memEntry.timestamp < memEntry.ttl) {
      return memEntry.data as T;
    }
    memoryCache.delete(key);
  }

  // 2. Check localStorage
  try {
    const stored = localStorage.getItem(`cache:${key}`);
    if (stored) {
      const entry: CacheEntry<T> = JSON.parse(stored);
      if (Date.now() - entry.timestamp < entry.ttl) {
        // Promote to memory cache
        memoryCache.set(key, entry);
        return entry.data;
      }
      localStorage.removeItem(`cache:${key}`);
    }
  } catch {
    // Ignore parse errors
  }

  return null;
}

/**
 * Save data to both memory and localStorage cache
 */
export function setToCache<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl };

  // Save to memory
  memoryCache.set(key, entry);

  // Save to localStorage (async, don't block)
  try {
    localStorage.setItem(`cache:${key}`, JSON.stringify(entry));
  } catch {
    // localStorage might be full or unavailable
  }
}

/**
 * Invalidate a specific cache key
 */
export function invalidateCache(key: string): void {
  memoryCache.delete(key);
  try {
    localStorage.removeItem(`cache:${key}`);
  } catch {
    // Ignore
  }
}

/** Remove cached API responses whose key contains the supplied URL fragment. */
export function invalidateCacheByFragment(fragment: string): void {
  for (const key of memoryCache.keys()) {
    if (key.includes(fragment)) memoryCache.delete(key);
  }
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey?.startsWith("cache:") && storageKey.includes(fragment)) {
        keysToRemove.push(storageKey);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore unavailable localStorage.
  }
}

/**
 * Clear all cached data
 */
export function clearAllCache(): void {
  memoryCache.clear();
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("cache:")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore
  }
}

/**
 * Generate a cache key from URL and params
 */
export function generateCacheKey(url: string, params?: Record<string, unknown>): string {
  if (!params) return url;
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return `${url}?${sorted}`;
}
