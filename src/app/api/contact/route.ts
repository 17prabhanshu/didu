import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getClientIdentifier } from "@/lib/request-ip";
import { Redis } from "@upstash/redis";
import { sendContactFormNotification } from "@/lib/email";

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const rateLimitMap = new Map<string, { count: number; lockUntil: number }>();
const MAX_SUBMISSIONS = 3;
const LOCK_TIME_MS = 60 * 60 * 1000; // 1 hour

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  if (redis) {
    const key = `rl:contact:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, 60 * 60); // 1 hour
    }
    if (count > MAX_SUBMISSIONS) {
      return { allowed: false, remaining: 0 };
    }
    return { allowed: true, remaining: MAX_SUBMISSIONS - count };
  } else {
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

    // Persist to the database so Admins can read it in the Inbox
    const contactMessage = await db.contactMessage.create({
      data: { name, email, subject: subject || '', message, status: 'UNREAD' }
    });

    // Send email notification to admin
    await sendContactFormNotification(
      name,
      email,
      subject || 'No Subject',
      message
    );

    return NextResponse.json({ 
      success: true, 
      message: "Message sent successfully! We'll get back to you soon.",
      id: contactMessage.id
    });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}