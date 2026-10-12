import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { Redis } from "@upstash/redis";
import { getClientIdentifier } from "@/lib/request-ip";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// ARCHITECTURE UPGRADE: Upstash Redis Rate Limiting vs Local Fallback
function getSafeRedis(): Redis | null {
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

const redis = getSafeRedis();

// Local fallback memory map
const rateLimitMap = new Map<string, { attempts: number; lockUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(req: Request) {
  try {
    const ip = getClientIdentifier(req);
    
    // 1. Check Rate Limit
    let checkedRedis = false;
    if (redis) {
      try {
        const attempts = await redis.get<number>(`rl:login:${ip}`) || 0;
        checkedRedis = true;
        if (attempts >= MAX_ATTEMPTS) {
          return NextResponse.json(
            { success: false, error: { message: `Too many attempts. Account locked.` } },
            { status: 429 }
          );
        }
      } catch (e) {
        console.warn("Login Redis rate limit warning (falling back to memory):", e);
      }
    }
    if (!checkedRedis) {
      const record = rateLimitMap.get(ip);
      if (record) {
        if (Date.now() < record.lockUntil) {
          const remainingMinutes = Math.ceil((record.lockUntil - Date.now()) / 60000);
          return NextResponse.json(
            { success: false, error: { message: `Too many attempts. Account locked for ${remainingMinutes} minutes.` } },
            { status: 429 }
          );
        }
        if (Date.now() > record.lockUntil && record.attempts >= MAX_ATTEMPTS) rateLimitMap.delete(ip);
      }
    }

    const body = await req.json();
    const { email, password } = loginSchema.parse(body);
    
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return recordFailedAttempt(ip);

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return recordFailedAttempt(ip);
    
    // Successful login - clear their failure record
    if (redis) {
      try {
        await redis.del(`rl:login:${ip}`);
      } catch {}
    }
    rateLimitMap.delete(ip);
    
    await createSession(user.id, user.role);
    return NextResponse.json({ success: true, data: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error: unknown) {
    // SECURITY: Do not leak internal error details (e.g. Zod messages, DB errors)
    // to the client. Only surface validation problems for malformed input.
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid email or password format." } },
        { status: 400 }
      );
    }
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Something went wrong. Please try again." } },
      { status: 500 }
    );
  }
}

async function recordFailedAttempt(ip: string) {
  let recordedInRedis = false;
  if (redis) {
    try {
      const attempts = await redis.incr(`rl:login:${ip}`);
      if (attempts === 1) await redis.expire(`rl:login:${ip}`, 15 * 60); // 15 min lock
      recordedInRedis = true;
    } catch {}
  }
  if (!recordedInRedis) {
    const record = rateLimitMap.get(ip) || { attempts: 0, lockUntil: 0 };
    record.attempts += 1;
    if (record.attempts >= MAX_ATTEMPTS) record.lockUntil = Date.now() + LOCK_TIME_MS;
    rateLimitMap.set(ip, record);
  }
  return NextResponse.json({ success: false, error: { message: "Invalid credentials" } }, { status: 401 });
}
