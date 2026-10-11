import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-secret-change-in-production'
if (process.env.NODE_ENV === 'production' && (!process.env.AUTH_SECRET || process.env.AUTH_SECRET === 'dev-secret-change-in-production')) {
  throw new Error("CRITICAL SECURITY ERROR: AUTH_SECRET must be set in production environment variables.");
}
const SESSION_DURATION = 30 * 60 // 30 minutes in seconds
const BCRYPT_SALT_ROUNDS = 12 // OWASP recommends 12+

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, AUTH_SECRET, { expiresIn: SESSION_DURATION })
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, AUTH_SECRET) as { userId: string; role: string }
    return decoded
  } catch (error) {
    return null
  }
}

export function getSessionExpiryDate(): Date {
  return new Date(Date.now() + SESSION_DURATION * 1000)
}
