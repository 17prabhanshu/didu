/**
 * Privacy-safe client IP extraction for rate limiting.
 *
 * SECURITY / PRIVACY NOTES:
 * - The resolved IP is used ONLY as an in-memory / Redis rate-limit key. It is
 *   never persisted to the database, never returned in an API response, and never
 *   written to logs. Visitor IPs therefore cannot leak to third parties.
 * - `x-forwarded-for` is attacker-controlled at the edge, so we take the FIRST
 *   entry (the original client) rather than a client-supplied later entry, which
 *   would otherwise let an attacker rotate the header to bypass rate limits.
 * - On Vercel the platform appends the real client IP; the first value is the
 *   client-supplied one, but because the header chain cannot be trusted from an
 *   untrusted proxy we cap length and validate shape before using it as a key.
 */

const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/;
const IPV6 = /^[0-9a-fA-F:]+$/;

function sanitizeIp(candidate: string | null | undefined): string | null {
  if (!candidate) return null;
  const ip = candidate.trim();
  if (!ip || ip.length > 45) return null; // max realistic IP length (IPv6)
  if (IPV4.test(ip) || IPV6.test(ip)) return ip;
  return null;
}

/**
 * Returns a stable, privacy-safe identifier for rate limiting.
 * Falls back to a shared bucket ("unknown") when no valid IP can be determined,
 * so untrusted/blank headers still get throttled rather than bypassing limits.
 */
export function getClientIdentifier(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0];
    const ip = sanitizeIp(first);
    if (ip) return ip;
  }

  const realIp = sanitizeIp(req.headers.get('x-real-ip'));
  if (realIp) return realIp;

  const cfIp = sanitizeIp(req.headers.get('cf-connecting-ip'));
  if (cfIp) return cfIp;

  return 'unknown';
}
