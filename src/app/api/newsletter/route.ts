import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getClientIdentifier } from '@/lib/request-ip';
import { newsletterSchema } from '@/lib/validation';

const rateLimitMap = new Map<string, { count: number; lockUntil: number }>();
const MAX_SUBMISSIONS = 5;
const LOCK_TIME_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: Request) {
  try {
    const ip = getClientIdentifier(req);
    const record = rateLimitMap.get(ip);
    
    if (record) {
      if (Date.now() < record.lockUntil) {
        return NextResponse.json({ success: false, error: "Too many attempts. Try again later." }, { status: 429 });
      }
      if (Date.now() > record.lockUntil) rateLimitMap.delete(ip);
    }
    
    const currentRecord = rateLimitMap.get(ip) || { count: 0, lockUntil: 0 };
    currentRecord.count += 1;
    if (currentRecord.count >= MAX_SUBMISSIONS) {
      currentRecord.lockUntil = Date.now() + LOCK_TIME_MS;
    }
    rateLimitMap.set(ip, currentRecord);

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

    // Validate with the shared schema (enforces valid email + required age 13–120)
    const parsed = newsletterSchema.safeParse({ email, age });
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || 'Invalid email or age';
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    // Save to the database
    // Use upsert to prevent unique constraint crashes if they subscribe twice
    await db.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      update: { status: 'ACTIVE', age: parsed.data.age, subscribedAt: new Date(), unsubscribedAt: null },
      create: { email: parsed.data.email, age: parsed.data.age, status: 'ACTIVE', subscribedAt: new Date() }
    });

    return NextResponse.json({ success: true, message: "Subscribed successfully!" });
  } catch (error) {
    console.error("Newsletter Subscription Error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
