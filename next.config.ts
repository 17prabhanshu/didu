import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  devIndicators: {
    position: 'bottom-right'
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production';

    // Content-Security-Policy tuned for this app.
    //
    // PRODUCTION (strict): no third-party origins are allowed. Self-hosted fonts
    // and the absence of analytics make a tight CSP viable, which blocks data
    // exfiltration / IP-leaking requests. 'unsafe-eval' is NOT allowed in prod.
    //
    // DEVELOPMENT (relaxed only where required): React explicitly requires eval()
    // in dev for debugging features, and Next.js HMR opens a WebSocket. Without
    // these the client bundle fails to execute and the page never hydrates
    // (the server HTML is fine, but the browser shows a broken/blank page).
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'";
    const connectSrc = isDev
      ? "connect-src 'self' ws: wss:"
      : "connect-src 'self'";

    const csp = [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      connectSrc,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; ") + (isDev ? "" : "; upgrade-insecure-requests");

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control', value: 'off' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
}

export default nextConfig
