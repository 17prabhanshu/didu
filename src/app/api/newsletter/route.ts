import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { newsletterSchema } from '@/lib/validation';
import { checkRateLimit, rateLimiters, rateLimitHeaders } from '@/lib/rate-limiter';
import { sendNewsletterConfirmationEmail, syncNewsletterAudience } from '@/lib/email';

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimit = await checkRateLimit(req, rateLimiters.newsletter);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Try again later." },
        { 
          status: 429,
          headers: rateLimitHeaders(rateLimit)
        }
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

    // Save to the database with timeout + legacy schema fallback
    try {
      await withTimeout(
        db.newsletterSubscriber.upsert({
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
        }),
        3000
      );
    } catch (dbError) {
      console.warn("Newsletter primary DB upsert warning, attempting legacy schema fallback:", dbError);
      try {
        await withTimeout(
          db.newsletterSubscriber.upsert({
            where: { email: parsed.data.email },
            update: {
              status: 'ACTIVE',
              age: parsed.data.age,
              subscribedAt: new Date(),
              unsubscribedAt: null,
            },
            create: {
              email: parsed.data.email,
              age: parsed.data.age,
              status: 'ACTIVE',
              subscribedAt: new Date(),
            },
          }),
          2000
        );
      } catch (fallbackError) {
        console.warn("Newsletter legacy DB upsert warning (resiliently proceeding):", fallbackError);
      }
    }

    // Sync subscriber to external newsletter audience & send confirmation email
    try {
      await withTimeout(
        Promise.allSettled([
          syncNewsletterAudience(parsed.data.email),
          sendNewsletterConfirmationEmail(parsed.data.email, confirmationToken),
        ]),
        3500
      );
    } catch (emailError) {
      console.warn("Newsletter email/audience dispatch warning:", emailError);
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
    }, {
      headers: rateLimitHeaders(rateLimit)
    });
  } catch (error) {
    console.error("Newsletter Subscription Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Something went wrong" 
    }, { status: 500 });
  }
}