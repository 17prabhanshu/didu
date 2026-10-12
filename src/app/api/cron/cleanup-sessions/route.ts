import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Delete expired sessions
    const deletedSessions = await db.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    // Delete expired password reset tokens
    const deletedTokens = await db.passwordResetToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    // Delete old audit logs (keep 1 year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const deletedAuditLogs = await db.auditLog.deleteMany({
      where: { createdAt: { lt: oneYearAgo } },
    });

    return NextResponse.json({
      success: true,
      deleted: {
        sessions: deletedSessions.count,
        passwordResetTokens: deletedTokens.count,
        auditLogs: deletedAuditLogs.count,
      },
    });
  } catch (error) {
    console.error('Cron cleanup error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}