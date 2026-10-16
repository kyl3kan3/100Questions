type Bucket = {
  count: number;
  resetAt: number;
};

const ipBuckets = new Map<string, Bucket>();

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

/**
 * Best-effort in-memory rate limiter for public tool APIs on serverless.
 * Limits apply per warm instance; CDN caching reduces repeat origin hits.
 */
export function checkPublicApiRateLimit(
  key: string,
  {
    limit,
    windowMs,
  }: {
    limit: number;
    windowMs: number;
  },
): RateLimitResult {
  const now = Date.now();
  const bucket = ipBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    ipBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 128);
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 128);
  return "unknown";
}

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

export function readMemoryCache<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value as T;
}

export function writeMemoryCache<T>(
  key: string,
  value: T,
  ttlMs: number,
): void {
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlMs });
}
