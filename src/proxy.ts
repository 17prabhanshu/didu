import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { validateCSRFToken } from '@/lib/csrf'

const DEFAULT_DEV_SECRET = 'dev-secret-change-in-production'
const SESSION_COOKIE_NAME = 'agentverse_session'

export default async function proxy(request: NextRequest) {
  const response = NextResponse.next()

  // Security Headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // CSRF / Origin Protection for all state-changing API routes
  if (request.nextUrl.pathname.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const csrfResponse = await validateCSRFToken(request)
    if (csrfResponse) {
      return csrfResponse
    }
  }

  // Admin Route Protection
  const isProtectedPath = 
    (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) ||
    request.nextUrl.pathname.startsWith('/api/admin');

  if (isProtectedPath) {
    const authSecret = process.env.AUTH_SECRET || DEFAULT_DEV_SECRET
    const isUnsafeProdSecret =
      process.env.NODE_ENV === 'production' &&
      (!process.env.AUTH_SECRET ||
        process.env.AUTH_SECRET === DEFAULT_DEV_SECRET ||
        process.env.AUTH_SECRET === 'generate-a-secure-random-string-here')

    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

    if (!token || isUnsafeProdSecret) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      const secret = new TextEncoder().encode(authSecret)
      await jwtVerify(token, secret, { algorithms: ['HS256'] })
    } catch {
      // Invalid token
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
