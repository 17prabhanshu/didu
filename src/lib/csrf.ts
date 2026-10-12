import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

const CSRF_SECRET =
  process.env.CSRF_SECRET ||
  process.env.AUTH_SECRET ||
  'csrf-secret-change-in-production'

const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const CSRF_TOKEN_TTL = 60 * 60 * 24 // 24 hours

export async function generateCSRFToken(): Promise<string> {
  const secret = new TextEncoder().encode(CSRF_SECRET)
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${CSRF_TOKEN_TTL}s`)
    .sign(secret)
  return token
}

export async function verifyCSRFToken(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(CSRF_SECRET)
    await jwtVerify(token, secret, { algorithms: ['HS256'] })
    return true
  } catch {
    return false
  }
}

export async function setCSRFTokenCookie(): Promise<string> {
  const token = await generateCSRFToken()
  const cookieStore = await cookies()
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: CSRF_TOKEN_TTL,
  })
  return token
}

export async function getCSRFTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_COOKIE_NAME)?.value ?? null
}

export async function getCSRFTokenFromRequest(req: NextRequest): Promise<string | null> {
  // Check header first (for AJAX requests)
  const headerToken = req.headers.get(CSRF_HEADER_NAME)
  if (headerToken) return headerToken
  
  // Check cookie (for form submissions)
  const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value
  if (cookieToken) return cookieToken
  
  return null
}

export async function validateCSRFToken(req: NextRequest): Promise<NextResponse | null> {
  // Skip validation for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return null
  }

  // Skip validation for webhook endpoints
  const pathname = req.nextUrl.pathname
  if (pathname.startsWith('/api/webhooks/')) {
    return null
  }

  // 1. Block explicit cross-site browser requests via Fetch Metadata header
  const secFetchSite = req.headers.get('sec-fetch-site')
  if (secFetchSite === 'cross-site') {
    return NextResponse.json(
      { success: false, error: { message: 'Cross-site request blocked by CSRF protection' } },
      { status: 403 }
    )
  }

  // 2. Validate Origin header against Host / NEXT_PUBLIC_SITE_URL when present
  const origin = req.headers.get('origin')
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host
  if (origin && host) {
    try {
      const originHost = new URL(origin).host
      const allowedHosts = new Set<string>([host])
      if (process.env.NEXT_PUBLIC_SITE_URL) {
        try {
          allowedHosts.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).host)
        } catch {}
      }
      if (!allowedHosts.has(originHost)) {
        return NextResponse.json(
          { success: false, error: { message: 'Cross-origin request blocked by CSRF protection' } },
          { status: 403 }
        )
      }
    } catch {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid Origin header' } },
        { status: 403 }
      )
    }
  }

  // 3. If an explicit CSRF token header is supplied, verify its cryptographic signature
  const headerToken = req.headers.get(CSRF_HEADER_NAME)
  if (headerToken) {
    const valid = await verifyCSRFToken(headerToken)
    if (!valid) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid or expired CSRF token' } },
        { status: 403 }
      )
    }
  }

  return null
}

export function csrfHeaders(token: string) {
  return {
    [CSRF_HEADER_NAME]: token,
    'X-CSRF-Token': token,
  }
}