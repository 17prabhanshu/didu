import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getClientIdentifier } from '@/lib/request-ip';
import { newsletterSchema, newsletterFooterSchema } from '@/lib/validation';
import { Redis } from "@upstash/redis";
import { sendNewsletterConfirmationEmail } from '@/lib/email';

// Use Upstash Redis for distributed rate limiting (works in serverless)
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Local fallback for development only
const rateLimitMap = new Map<string, { count: number; lockUntil: number }>();
const MAX_SUBMISSIONS = 5;
const LOCK_TIME_MS = 60 * 60 * 1000; // 1 hour

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  if (redis) {
    const key = `rl:newsletter:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, 60 * 60); // 1 hour
    }
    if (count > MAX_SUBMISSIONS) {
      return { allowed: false, remaining: 0 };
    }
    return { allowed: true, remaining: MAX_SUBMISSIONS - count };
  } else {
    // Fallback to in-memory (dev only)
    const record = rateLimitMap.get(ip);
    if (record) {
      if (Date.now() < record.lockUntil) {
        return { allowed: false, remaining: 0 };
      }
      if (Date.now() > record.lockUntil) rateLimitMap.delete(ip);
    }
    const currentRecord = rateLimitMap.get(ip) || { count: 0, lockUntil: 0 };
    currentRecord.count += 1;
    if (currentRecord.count >= MAX_SUBMISSIONS) {
      currentRecord.lockUntil = Date.now() + LOCK_TIME_MS;
    }
    rateLimitMap.set(ip, currentRecord);
    return { allowed: true, remaining: MAX_SUBMISSIONS - currentRecord.count };
  }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIdentifier(req);
    const rateLimit = await checkRateLimit(ip);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }

    // Support both JSON and FormData
    let email: string | null = null;
    let age: unknown = null;
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await req.json();
      email = json.email;
      age = json.age;
    } else {
      const body = await req.formData();
      email = body.get('email') as string;
      age = body.get('age') as string;
    }

    // Clean and normalize email & age
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanAge = age !== null && age !== undefined && age !== '' ? Number(age) : undefined;

    // Validate with the shared schema
    const parsed = newsletterSchema.safeParse({ email: cleanEmail, age: cleanAge });
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || 'Invalid email address';
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    // Generate tokens for confirmation and unsubscribe workflows
    const confirmationToken = crypto.randomUUID();
    const unsubscribeToken = crypto.randomUUID();

    // Save to the database with resilient fallback if DB is cold or unreachable
    try {
      await db.newsletterSubscriber.upsert({
        where: { email: parsed.data.email },
        update: { 
          status: 'ACTIVE', 
          age: parsed.data.age, 
          subscribedAt: new Date(), 
          unsubscribedAt: null,
          confirmationToken,
          unsubscribeToken
        },
        create: { 
          email: parsed.data.email, 
          age: parsed.data.age, 
          status: 'ACTIVE', 
          subscribedAt: new Date(),
          confirmationToken,
          unsubscribeToken
        }
      });
    } catch (dbError) {
      console.warn("Newsletter DB upsert warning (resiliently proceeding):", dbError);
    }

    // Send confirmation/welcome briefing email
    try {
      await sendNewsletterConfirmationEmail(parsed.data.email, confirmationToken);
    } catch (emailError) {
      console.warn("Newsletter email dispatch warning:", emailError);
    }

    // If submitted via standard browser HTML form navigation (not AJAX)
    const acceptHeader = req.headers?.get?.('accept') || '';
    if (acceptHeader.includes('text/html')) {
      const baseUrl = req.url && req.url.startsWith('http') 
        ? req.url 
        : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
      try {
        return NextResponse.redirect(new URL('/newsletter?subscribed=true', baseUrl));
      } catch (e) {
        console.error("Redirect URL creation failed:", e);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Subscribed successfully!",
      redirectUrl: "/newsletter?subscribed=true"
    });
  } catch (error) {
    console.error("Newsletter Subscription Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Something went wrong" 
    }, { status: 500 });
  }
}
