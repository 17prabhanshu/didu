import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendNewsletterUnsubscribeEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid or missing unsubscribe token.' } },
        { status: 400 }
      );
    }

    const subscription = await db.newsletterSubscriber.findFirst({
      where: { 
        unsubscribeToken: token,
        status: 'ACTIVE'
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid or expired unsubscribe token.' } },
        { status: 400 }
      );
    }

    await db.newsletterSubscriber.update({
      where: { id: subscription.id },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribeToken: null,
        unsubscribedAt: new Date(),
      },
    });

    // Send unsubscribe confirmation in background
    try {
      await sendNewsletterUnsubscribeEmail(subscription.email);
    } catch (e) {
      console.error('Failed to send newsletter unsubscribe email:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'You have been successfully unsubscribed.',
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Something went wrong. Please try again.' } },
      { status: 500 }
    );
  }
}