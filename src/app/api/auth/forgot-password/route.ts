import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import { checkRateLimit, rateLimiters, rateLimitHeaders } from '@/lib/rate-limiter';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const rateLimit = await checkRateLimit(req, rateLimiters.passwordReset);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: { message: 'Too many requests. Please try again later.' } },
        { status: 429, headers: rateLimitHeaders(rateLimit) }
      );
    }

    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: { message: 'Valid email is required.' } },
        { status: 400 }
      );
    }

    // Find user (don't reveal if exists)
    const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });

    // Always return success to prevent email enumeration
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.passwordResetToken.create({
        data: {
          token: hashedToken,
          userId: user.id,
          expiresAt,
        },
      });

      await sendPasswordResetEmail(user.email, rawToken, user.name || 'User');
    }

    return NextResponse.json(
      {
        success: true,
        message: 'If an account exists, a password reset link has been sent.',
      },
      { headers: rateLimitHeaders(rateLimit) }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Something went wrong. Please try again.' } },
      { status: 500 }
    );
  }
}