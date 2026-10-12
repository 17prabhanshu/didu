import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { checkRateLimit, rateLimiters, rateLimitHeaders } from '@/lib/rate-limiter';
import { sendContactFormNotification, sendContactFormAutoReply } from "@/lib/email";
import { checkIdempotency, storeIdempotencyResponse, getIdempotencyKey } from '@/lib/idempotency';

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

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') +
    '-' +
    Date.now().toString(36)
  );
}

export async function POST(req: Request) {
  try {
    // Idempotency check
    const idempotencyKey = getIdempotencyKey(req);
    if (idempotencyKey) {
      const { isDuplicate, cachedResponse } = await checkIdempotency(idempotencyKey);
      if (isDuplicate && cachedResponse) {
        return NextResponse.json(cachedResponse, { 
          headers: { ...rateLimitHeaders({ allowed: true, remaining: 0, resetMs: 0 }), 'X-Idempotency-Replay': 'true' }
        });
      }
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(req, rateLimiters.contact);
    
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
    let name: string | null = null;
    let email: string | null = null;
    let subject: string | null = null;
    let message: string | null = null;
    let submissionType: string | null = null;
    let entityName: string | null = null;
    let websiteUrl: string | null = null;
    let githubUrl: string | null = null;
    let description: string | null = null;

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await req.json();
      name = json.name;
      email = json.email;
      subject = json.subject;
      message = json.message;
      submissionType = json.submissionType || null;
      entityName = json.entityName || null;
      websiteUrl = json.websiteUrl || null;
      githubUrl = json.githubUrl || null;
      description = json.description || null;
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
    const cleanSubject = subject || '';

    // Persist to the database
    let contactId: string | undefined;
    try {
      const contactMessage = await withTimeout(
        db.contactMessage.create({
          data: { name: cleanName, email: cleanEmail, subject: cleanSubject, message, status: 'UNREAD' }
        }),
        3000
      );
      contactId = contactMessage.id;
    } catch (dbError) {
      console.warn("Contact message DB create warning (resiliently proceeding):", dbError);
    }

    // Automated Directory Submission Pipeline (/submit -> Tool / Agent / Article record)
    const isDirectorySubmission =
      submissionType ||
      cleanSubject.startsWith('[Tool Submission]') ||
      cleanSubject.startsWith('[Agent Submission]') ||
      cleanSubject.startsWith('[Guest Post Pitch]');

    let autoApproved = false;
    if (isDirectorySubmission) {
      try {
        const autoApprove = process.env.AUTO_APPROVE_SUBMISSIONS === 'true';
        const targetStatus = autoApprove ? 'PUBLISHED' : 'DRAFT';
        autoApproved = autoApprove;

        const inferredTitle =
          (entityName || cleanSubject.replace(/^\[.*?\]\s*/, '') || 'Submitted Resource')
            .replace(/Guest|Sponsor/gi, 'Analyst')
            .trim();
        const slug = slugify(inferredTitle);
        const rawDesc = (description || message)
          .replace(/guest poster|guest writer|guest author/gi, 'Contributing Analyst')
          .replace(/guest post|sponsored post|paid post/gi, 'independent research');

        const type =
          submissionType ||
          (cleanSubject.startsWith('[Agent Submission]')
            ? 'agent'
            : cleanSubject.startsWith('[Guest Post Pitch]')
            ? 'article'
            : 'tool');

        if (type === 'tool' && (db as any).tool?.create) {
          await withTimeout(
            (db as any).tool.create({
              data: {
                name: inferredTitle,
                slug,
                tagline: rawDesc.slice(0, 140),
                description: rawDesc,
                websiteUrl: websiteUrl || null,
                githubUrl: githubUrl || null,
                status: targetStatus,
              },
            }),
            2500
          );
        } else if (type === 'agent' && (db as any).agent?.create) {
          await withTimeout(
            (db as any).agent.create({
              data: {
                name: inferredTitle,
                slug,
                tagline: rawDesc.slice(0, 140),
                description: rawDesc,
                websiteUrl: websiteUrl || null,
                githubUrl: githubUrl || null,
                status: targetStatus,
              },
            }),
            2500
          );
        } else if (type === 'article' && (db as any).article?.create && (db as any).author) {
          const fallbackAuthor =
            (await (db as any).author.findFirst()) ||
            (await (db as any).author.create({
              data: {
                name: 'Intelligence Desk',
                slug: 'intelligence-desk',
                bio: 'Agentverse internal research team.',
              },
            }));
          await withTimeout(
            (db as any).article.create({
              data: {
                title: inferredTitle,
                slug,
                excerpt: rawDesc.slice(0, 180),
                body: `<p>${rawDesc.replace(/\n+/g, '</p><p>')}</p>`,
                contentType: 'RESEARCH',
                status: targetStatus,
                publishedAt: autoApprove ? new Date() : null,
                authorId: fallbackAuthor.id,
              },
            }),
            2500
          );
        }
      } catch (subErr) {
        console.warn("Automated directory submission record creation warning:", subErr);
      }
    }

    // Send email notifications
    try {
      await withTimeout(
        Promise.allSettled([
          sendContactFormNotification(cleanName, cleanEmail, cleanSubject || 'No Subject', message),
          sendContactFormAutoReply(cleanName, cleanEmail),
        ]),
        3500
      );
    } catch (e) {
      console.warn("Contact email dispatch warning:", e);
    }

    const responseData = { 
      success: true, 
      message: autoApproved
        ? "Submission received and auto-approved to the live directory!"
        : "Message sent successfully! We'll get back to you soon.",
      autoApproved,
      id: contactId || 'submitted'
    };

    // Store idempotency response
    if (idempotencyKey) {
      await storeIdempotencyResponse(idempotencyKey, responseData);
    }

    return NextResponse.json(responseData, {
      headers: rateLimitHeaders(rateLimit)
    });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Something went wrong" 
    }, { status: 500 });
  }
}