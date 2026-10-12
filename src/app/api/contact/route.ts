import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getClientIdentifier } from "@/lib/request-ip";
import { Redis } from "@upstash/redis";
import { sendContactFormNotification, sendContactFormAutoReply } from "@/lib/email";

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

const rateLimitMap = new Map<string, { count: number; lockUntil: number }>();
const MAX_SUBMISSIONS = 10;
const LOCK_TIME_MS = 60 * 60 * 1000; // 1 hour

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  if (redis) {
    try {
      const key = `rl:contact:${ip}`;
      const count = await withTimeout(redis.incr(key), 1500);
      if (count === 1) {
        await withTimeout(redis.expire(key, 60 * 60), 1500);
      }
      if (count > MAX_SUBMISSIONS) {
        return { allowed: false, remaining: 0 };
      }
      return { allowed: true, remaining: MAX_SUBMISSIONS - count };
    } catch (err) {
      console.warn("Upstash Redis contact rate limit warning (falling back to memory):", err);
    }
  }

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
    let name: string | null = null;
    let email: string | null = null;
    let subject: string | null = null;
    let message: string | null = null;

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await req.json();
      name = json.name;
      email = json.email;
      subject = json.subject;
      message = json.message;
    } else {
      const body = await req.formData();
      name = body.get('name') as string;
      email = body.get('email') as string;
      subject = body.get('subject') as string;
      message = body.get('message') as string;
    }

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: "Name, email, and message are required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Persist to the database with resilient 3s timeout fallback
    let contactId: string | undefined;
    try {
      const contactMessage = await withTimeout(
        db.contactMessage.create({
          data: { name: cleanName, email: cleanEmail, subject: subject || '', message, status: 'UNREAD' }
        }),
        3000
      );
      contactId = contactMessage.id;
    } catch (dbError) {
      console.warn("Contact message DB create warning (resiliently proceeding with emails):", dbError);
    }

    // Send email notifications with timeout guard
    try {
      await withTimeout(
        Promise.allSettled([
          sendContactFormNotification(cleanName, cleanEmail, subject || 'No Subject', message),
          sendContactFormAutoReply(cleanName, cleanEmail),
        ]),
        3500
      );
    } catch (e) {
      console.warn("Contact email dispatch warning:", e);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Message sent successfully! We'll get back to you soon.",
      id: contactId || 'submitted'
    });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Something went wrong" 
    }, { status: 500 });
  }
}