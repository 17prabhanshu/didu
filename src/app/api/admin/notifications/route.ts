import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/session';

export async function GET() {
  try {
    await requireAuth();

    // Fetch recent contact messages (unread)
    const unreadMessages = await db.contactMessage.findMany({
      where: { status: 'UNREAD' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, name: true, email: true, subject: true, message: true, createdAt: true },
    });

    // Fetch pending subscribers
    const pendingSubscribers = await db.newsletterSubscriber.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, email: true, createdAt: true },
    });

    // Fetch active security alerts
    const securityAlerts = await db.securityAlert.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      select: { id: true, title: true, severity: true, summary: true, publishedAt: true },
    });

    const notifications = [
      ...unreadMessages.map((msg) => ({
        id: `message-${msg.id}`,
        type: 'message' as const,
        title: `New message from ${msg.name}`,
        message: msg.subject || msg.message.substring(0, 100) + '...',
        time: formatTimeAgo(msg.createdAt),
        read: false,
        href: `/admin/inbox/${msg.id}`,
      })),
      ...pendingSubscribers.map((sub) => ({
        id: `subscriber-${sub.id}`,
        type: 'subscriber' as const,
        title: 'New subscriber pending confirmation',
        message: `${sub.email} needs to confirm subscription`,
        time: formatTimeAgo(sub.createdAt),
        read: false,
        href: `/admin/subscribers`,
      })),
      ...securityAlerts.map((alert) => ({
        id: `security-${alert.id}`,
        type: 'security' as const,
        title: `Security Alert: ${alert.title}`,
        message: alert.summary?.substring(0, 100) + '...' || 'New security alert published',
        time: formatTimeAgo(alert.publishedAt || alert.id),
        read: false,
        href: `/admin/security`,
      })),
    ].sort((a, b) => {
      // Sort by time (most recent first) - simplified since we use relative times
      return 0;
    }).slice(0, 20);

    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function formatTimeAgo(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}