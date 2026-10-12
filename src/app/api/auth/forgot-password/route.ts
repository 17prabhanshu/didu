import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import { getClientIdentifier } from '@/lib/request-ip';
import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: Request) {
  try {
    const ip = getClientIdentifier(req);
    const key = `rl:pwd-reset:${ip}`;

    // Rate limiting
    if (redis) {
      const attempts = await redis.get<number>(key) || 0;
      if (attempts >= RATE_LIMIT_MAX) {
        return NextResponse.json(
          { success: false, error: { message: 'Too many requests. Please try again later.' } },
          { status: 429 }
        );
      }
      await redis.incr(key);
      if (attempts === 0) await redis.expire(key, 60 * 60);
    }

    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: { message: 'Valid email is required.' } },
        { status: 400 }
      );
    }

    // Find user (don't reveal if exists)
    const user = await db.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (user) {
      const token = require('crypto').randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      });

      await sendPasswordResetEmail(user.email, token, user.name || 'User');
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Something went wrong. Please try again.' } },
      { status: 500 }
    );
  }
}