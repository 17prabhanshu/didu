import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendPasswordResetSuccessEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: { message: 'Token and password are required.' } },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: { message: 'Password must be at least 8 characters.' } },
        { status: 400 }
      );
    }

    // Validate password strength
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasUpper || !hasLower || !hasNumber) {
      return NextResponse.json(
        { success: false, error: { message: 'Password must contain uppercase, lowercase, and number.' } },
        { status: 400 }
      );
    }

    const hashedToken = crypto.createHash('sha256').update(String(token)).digest('hex');

    // O(1) indexed lookup by SHA-256 token hash (with fallback for legacy plain tokens)
    const resetToken = await db.passwordResetToken.findFirst({
      where: {
        OR: [{ token: hashedToken }, { token: String(token) }],
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid or expired reset token.' } },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash: hashedPassword,
        mustChangePassword: false,
      },
    });

    // Delete used token
    await db.passwordResetToken.delete({ where: { id: resetToken.id } });

    // Delete all user sessions (force re-login)
    await db.session.deleteMany({ where: { userId: resetToken.userId } });

    // Send confirmation email
    if (resetToken.user?.email) {
      try {
        await sendPasswordResetSuccessEmail(resetToken.user.email, resetToken.user.name || undefined);
      } catch (e) {
        console.error('Failed to send password reset confirmation email:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset. Please log in with your new password.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Something went wrong. Please try again.' } },
      { status: 500 }
    );
  }
}