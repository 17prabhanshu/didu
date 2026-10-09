import { cookies } from 'next/headers'
import { db } from './db'
import { verifyToken, generateToken, getSessionExpiryDate } from './auth'

const SESSION_COOKIE_NAME = 'agentverse_session'

export type SessionData = {
  userId: string
  role: string
  sessionId: string
}

export async function createSession(userId: string, role: string): Promise<string> {
  const token = generateToken({ userId, role })
  const expiresAt = getSessionExpiryDate()

  const session = await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // SECURITY PATCH: Omitting 'expires' forces this to be a volatile "Session Cookie".
    // The browser will automatically delete it the moment the user closes their browser window.
  })

  return token
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  const payload = verifyToken(token)

  if (!payload) {
    return null
  }

  const session = await db.session.findUnique({
    where: { token },
  })

  if (!session || session.expiresAt < new Date()) {
    return null
  }

  return {
    userId: payload.userId,
    role: payload.role,
    sessionId: session.id,
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (token) {
    await db.session.deleteMany({
      where: { token },
    })
  }

  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getSession()

  if (!session) {
    const nav = require('next/navigation');
    nav.redirect('/admin/login');
  }

  return session as SessionData;
}

export async function requireRole(roles: string[]): Promise<SessionData> {
  const session = await requireAuth()

  if (!roles.includes(session.role)) {
    throw new Error('Forbidden')
  }

  return session
}
