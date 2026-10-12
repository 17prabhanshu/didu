import { Redis } from '@upstash/redis';

function getRedis(): Redis | null {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
    if (
      !url ||
      !token ||
      !url.startsWith('https://') ||
      url.includes('your-redis.upstash.io') ||
      url.includes('xxx.upstash.io') ||
      token === 'your_redis_rest_token_here'
    ) {
      return null;
    }
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

const redis = getRedis();

// In-memory fallback for development
const memoryIdempotencyStore = new Map<string, { data: any; expiresAt: number }>();

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface IdempotencyResult<T = any> {
  isDuplicate: boolean;
  cachedResponse?: T;
}

export async function checkIdempotency<T = any>(key: string): Promise<IdempotencyResult<T>> {
  if (!key) return { isDuplicate: false };

  const fullKey = `idem:${key}`;

  if (redis) {
    try {
      const cached = await redis.get(fullKey);
      if (cached) {
        return { isDuplicate: true, cachedResponse: cached as T };
      }
    } catch (error) {
      console.warn('Redis idempotency check failed:', error);
    }
  }

  // Development fallback
  const record = memoryIdempotencyStore.get(fullKey);
  if (record && Date.now() < record.expiresAt) {
    return { isDuplicate: true, cachedResponse: record.data };
  }

  return { isDuplicate: false };
}

export async function storeIdempotencyResponse(key: string, response: any): Promise<void> {
  if (!key) return;

  const fullKey = `idem:${key}`;

  if (redis) {
    try {
      await redis.set(fullKey, response, { ex: 24 * 60 * 60 }); // 24 hours
      return;
    } catch (error) {
      console.warn('Redis idempotency store failed:', error);
    }
  }

  // Development fallback
  memoryIdempotencyStore.set(fullKey, {
    data: response,
    expiresAt: Date.now() + IDEMPOTENCY_TTL_MS,
  });

  // Cleanup
  if (memoryIdempotencyStore.size > 5000) {
    const now = Date.now();
    for (const [k, v] of memoryIdempotencyStore.entries()) {
      if (now > v.expiresAt) memoryIdempotencyStore.delete(k);
    }
  }
}

export function getIdempotencyKey(req: Request): string | null {
  // Check header first
  const headerKey = req.headers.get('Idempotency-Key') || req.headers.get('idempotency-key');
  if (headerKey) return headerKey;

  // Could also check for a cookie or query param
  return null;
}