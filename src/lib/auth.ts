import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const DEFAULT_DEV_SECRET = 'dev-secret-change-in-production'
const AUTH_SECRET = process.env.AUTH_SECRET || DEFAULT_DEV_SECRET
const SESSION_DURATION = 30 * 60 // 30 minutes in seconds
const BCRYPT_SALT_ROUNDS = 12 // OWASP recommends 12+

function getSigningSecret(): string {
  if (
    process.env.NODE_ENV === 'production' &&
    (!process.env.AUTH_SECRET ||
      process.env.AUTH_SECRET === DEFAULT_DEV_SECRET ||
      process.env.AUTH_SECRET === 'generate-a-secure-random-string-here')
  ) {
    console.error('CRITICAL SECURITY WARNING: AUTH_SECRET is not configured with a strong secret in production.')
  }
  return AUTH_SECRET
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, getSigningSecret(), {
    expiresIn: SESSION_DURATION,
    algorithm: 'HS256',
  })
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, getSigningSecret(), {
      algorithms: ['HS256'],
    }) as { userId: string; role: string }
    return decoded
  } catch {
    return null
  }
}

export function getSessionExpiryDate(): Date {
  return new Date(Date.now() + SESSION_DURATION * 1000)
}
