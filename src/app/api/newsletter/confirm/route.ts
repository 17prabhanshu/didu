import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendNewsletterWelcomeEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid or missing confirmation token.' } },
        { status: 400 }
      );
    }

    const subscription = await db.newsletterSubscriber.findFirst({
      where: { 
        confirmationToken: token,
        status: 'PENDING'
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid or expired confirmation token.' } },
        { status: 400 }
      );
    }

    await db.newsletterSubscriber.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        confirmationToken: null,
        confirmedAt: new Date(),
      },
    });

    // Send welcome email in background
    try {
      await sendNewsletterWelcomeEmail(subscription.email);
    } catch (e) {
      console.error('Failed to send newsletter welcome email:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription confirmed successfully!',
    });
  } catch (error) {
    console.error('Newsletter confirmation error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Something went wrong. Please try again.' } },
      { status: 500 }
    );
  }
}