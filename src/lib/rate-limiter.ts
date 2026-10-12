import { Redis } from '@upstash/redis';
import { getClientIdentifier } from './request-ip';

interface RateLimitConfig {
  prefix: string;
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

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

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// In-memory fallback when Upstash Redis is not configured or unreachable
const memoryStore = new Map<string, { count: number; resetAt: number }>();

export class RateLimiter {
  public readonly config: Required<RateLimitConfig>;
  
  constructor(config: RateLimitConfig) {
    this.config = {
      prefix: config.prefix,
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
      keyPrefix: config.keyPrefix || 'rl',
    };
  }

  private getKey(identifier: string): string {
    return `${this.config.keyPrefix}:${this.config.prefix}:${identifier}`;
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const key = this.getKey(identifier);
    const windowSec = Math.ceil(this.config.windowMs / 1000);

    if (redis) {
      try {
        const count = await withTimeout(redis.incr(key), 1500);
        if (count === 1) {
          await withTimeout(redis.expire(key, windowSec), 1000).catch(() => {});
        }
        const remaining = Math.max(0, this.config.maxRequests - count);
        const resetMs = Date.now() + this.config.windowMs;
        
        return {
          allowed: count <= this.config.maxRequests,
          remaining,
          resetMs,
        };
      } catch (error) {
        console.warn('Redis rate limit error:', error);
        if (process.env.NODE_ENV === 'production' && process.env.REQUIRE_REDIS_IN_PROD === 'true') {
          return { allowed: false, remaining: 0, resetMs: Date.now() + this.config.windowMs };
        }
        // Fall through to in-memory store
      }
    }

    if (process.env.NODE_ENV === 'production' && process.env.REQUIRE_REDIS_IN_PROD === 'true' && !redis) {
      return { allowed: false, remaining: 0, resetMs: Date.now() + this.config.windowMs };
    }

    // Fallback to in-memory store
    const now = Date.now();
    const record = memoryStore.get(key);
    
    if (record) {
      if (now > record.resetAt) {
        memoryStore.set(key, { count: 1, resetAt: now + this.config.windowMs });
        return { allowed: true, remaining: this.config.maxRequests - 1, resetMs: now + this.config.windowMs };
      } else {
        const newCount = record.count + 1;
        memoryStore.set(key, { ...record, count: newCount });
        const allowed = newCount <= this.config.maxRequests;
        return { 
          allowed, 
          remaining: Math.max(0, this.config.maxRequests - newCount), 
          resetMs: record.resetAt 
        };
      }
    } else {
      memoryStore.set(key, { count: 1, resetAt: now + this.config.windowMs });
      // Cleanup expired entries periodically
      if (memoryStore.size > 10000) {
        for (const [k, v] of memoryStore.entries()) {
          if (now > v.resetAt) memoryStore.delete(k);
        }
      }
      return { allowed: true, remaining: this.config.maxRequests - 1, resetMs: now + this.config.windowMs };
    }
  }

  async reset(identifier: string): Promise<void> {
    const key = this.getKey(identifier);
    if (redis) {
      try {
        await withTimeout(redis.del(key), 1500);
      } catch {}
    }
    memoryStore.delete(key);
  }
}

// Pre-configured limiters for common use cases
export const rateLimiters = {
  login: new RateLimiter({ prefix: 'login', maxRequests: 5, windowMs: 15 * 60 * 1000 }),
  newsletter: new RateLimiter({ prefix: 'newsletter', maxRequests: 5, windowMs: 60 * 60 * 1000 }),
  contact: new RateLimiter({ prefix: 'contact', maxRequests: 3, windowMs: 60 * 60 * 1000 }),
  passwordReset: new RateLimiter({ prefix: 'pwd-reset', maxRequests: 3, windowMs: 60 * 60 * 1000 }),
  search: new RateLimiter({ prefix: 'search', maxRequests: 30, windowMs: 60 * 1000 }),
  upload: new RateLimiter({ prefix: 'upload', maxRequests: 10, windowMs: 60 * 60 * 1000 }),
  api: new RateLimiter({ prefix: 'api', maxRequests: 100, windowMs: 60 * 1000 }),
};

export async function checkRateLimit(
  req: Request,
  limiter: RateLimiter
): Promise<{ allowed: boolean; remaining: number; resetMs: number }> {
  const identifier = getClientIdentifier(req);
  return limiter.check(identifier);
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': rateLimiters.api.config.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetMs / 1000).toString(),
  };
}