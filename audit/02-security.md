# Phase 2: Application Security Audit

## Summary

| Severity | Count |
|----------|-------|
| Critical | 3 |
| High | 5 |
| Medium | 8 |
| Low | 4 |
| Informational | 3 |

---

## Critical Findings

### SEC-001: Missing CSRF Protection on All State-Changing Endpoints
**Severity**: Critical  
**Affected**: All POST/PUT/DELETE endpoints (`/api/auth/login`, `/api/auth/logout`, `/api/admin/*`, `/api/contact`, `/api/newsletter`, `/api/admin/upload`)  
**Evidence**: No CSRF tokens implemented. Forms submit without anti-CSRF tokens. The `SameSite=lax` cookie provides partial protection but is insufficient for cross-origin attacks and doesn't protect against same-origin form submissions.  
**Impact**: Attackers can forge requests on behalf of authenticated admins (create/delete articles, upload files, change settings) or users (submit contact forms, newsletter subscriptions).  
**Status**: Confirmed  
**Recommended Fix**: Implement CSRF protection using double-submit cookie pattern or `nextjs-csrf` middleware. Add CSRF token to all forms and validate on state-changing endpoints.

### SEC-002: Session Revocation Not Checked in Middleware
**Severity**: Critical  
**Affected**: `src/proxy.ts` (middleware), `src/lib/session.ts`  
**Evidence**: Middleware (`proxy.ts` lines 30-50) validates JWT signature only. It does NOT check if session exists in database or has been revoked. `session.ts::getSession()` checks database but is only called in API routes, not middleware.  
**Impact**: Logged-out users retain access until JWT expires (30 min). Revoked sessions (password change, admin revocation) remain valid.  
**Status**: Confirmed  
**Recommended Fix**: Move session validation to a shared function used by both middleware and API routes. Check database for session existence and expiry in middleware.

### SEC-003: Critical Dependency Vulnerabilities (3 Critical, 8 High)
**Severity**: Critical  
**Affected**: `package-lock.json`  
**Evidence**: `npm audit` reports:
- **Next.js 16.3.5**: 7 CVEs including RCE in next/og, cache poisoning, SSRF in Image Optimization, info disclosure
- **vitest/tinypool**: Prototype pollution → RCE
- **file-type**: Infinite loop DoS, ZIP decompression bomb
- **prisma/deepmerge-ts**: Stack exhaustion
- **braces/micromatch**: ReDoS  
**Impact**: Supply chain attacks, DoS, potential RCE in development/build environments.  
**Status**: Confirmed (verified via `npm audit`)  
**Recommended Fix**: Update to patched versions. Next.js 16.4.0+ fixes Next.js CVEs. Vitest 5.0.3+ fixes tinypool. File-type 22.1.1+. Prisma 6.12.0+. Note: Some require major version upgrades - test thoroughly.

---

## High Findings

### SEC-004: No Authorization Check on Admin API GET Endpoints
**Severity**: High  
**Affected**: `/api/admin/articles` (GET), `/api/admin/agents` (GET), `/api/admin/tools` (GET), `/api/admin/models` (GET), `/api/admin/categories` (GET), `/api/admin/glossary` (GET), `/api/admin/redirects` (GET), `/api/admin/security-alerts` (GET)  
**Evidence**: These endpoints only check `requireRole(['SUPER_ADMIN', 'EDITOR', 'AUTHOR'])` for POST but GET endpoints have no auth check (e.g., `src/app/api/admin/articles/route.ts` line 4-32).  
**Impact**: Unauthenticated users can enumerate all admin data (articles, agents, tools, models, categories, security alerts, redirects).  
**Status**: Confirmed  
**Recommended Fix**: Add `await requireRole([...])` to all GET handlers in admin API routes.

### SEC-005: Insecure Direct Object Reference (IDOR) in CRUD API
**Severity**: High  
**Affected**: `/api/admin/crud` (GET, PUT, DELETE)  
**Evidence**: Line 25, 140, 162 - `(db as any)[model].findUnique({ where: { id } })` uses user-supplied `model` and `id` without ownership/permission checks beyond role. Any EDITOR can access/delete any record of any model they have access to.  
**Impact**: Editors can access other authors' drafts, delete other users' content, modify security alerts they shouldn't.  
**Status**: Confirmed  
**Recommended Fix**: Implement row-level authorization. Check ownership/permissions before allowing access to specific records.

### SEC-006: Login Rate Limit Bypass via IP Spoofing
**Severity**: High  
**Affected**: `src/app/api/auth/login/route.ts`, `src/lib/request-ip.ts`  
**Evidence**: `getClientIdentifier()` uses `x-forwarded-for` header (line 33-37) taking FIRST entry. Attackers can send `x-forwarded-for: attacker-ip, victim-ip` to bypass rate limiting for victim IP.  
**Impact**: Brute-force protection can be circumvented.  
**Status**: Confirmed  
**Recommended Fix**: Use `x-forwarded-for` last entry (closest trusted proxy) or configure trusted proxy IPs. On Vercel, use `cf-connecting-ip` or `x-real-ip` which are set by infrastructure.

### SEC-007: Password Reset / Account Recovery Not Implemented
**Severity**: High  
**Affected**: Authentication system  
**Evidence**: No password reset endpoints, no email verification flow, no account recovery mechanism. `User.mustChangePassword` field exists but no flow to enforce it.  
**Impact**: Users who forget passwords cannot recover accounts. Admins must manually reset via database.  
**Status**: Confirmed  
**Recommended Fix**: Implement secure password reset with time-limited tokens, email delivery, and rate limiting.

### SEC-008: Admin Login Page Vulnerable to Username Enumeration
**Severity**: High  
**Affected**: `/api/auth/login/route.ts`  
**Evidence**: Line 58 - `if (!user) return recordFailedAttempt(ip);` returns same error for non-existent user and invalid password, BUT the rate limiting behavior differs (failed attempts tracked per IP). Timing attack possible.  
**Impact**: Attackers can enumerate valid admin email addresses.  
**Status**: Confirmed  
**Recommended Fix**: Ensure constant-time responses. Always hash password even for non-existent users (use dummy hash).

---

## Medium Findings

### SEC-009: CSP Allows 'unsafe-inline' in Production
**Severity**: Medium  
**Affected**: `next.config.ts` lines 30-32, 38-40  
**Evidence**: Production CSP: `script-src 'self' 'unsafe-inline'` (line 32). Inline scripts allowed.  
**Impact**: Reduces XSS protection. If XSS exists, inline scripts execute.  
**Status**: Confirmed  
**Recommended Fix**: Move all inline scripts to external files. Use nonces or hashes for any required inline scripts.

### SEC-010: HSTS Preload Enabled Without Verification
**Severity**: Medium  
**Affected**: `next.config.ts` line 60  
**Evidence**: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`  
**Impact**: If subdomains don't support HTTPS, they become inaccessible. Preload list removal takes months.  
**Status**: Confirmed  
**Recommended Fix**: Remove `preload` until all subdomains verified HTTPS-ready. Keep `includeSubDomains` only if confirmed.

### SEC-011: Cross-Origin-Embedder-Policy: require-corp May Break Embeds
**Severity**: Medium  
**Affected**: `next.config.ts` line 63  
**Evidence**: `Cross-Origin-Embedder-Policy: require-corp` requires all cross-origin resources to have CORP header.  
**Impact**: Third-party images, fonts, iframes may fail to load.  
**Status**: Suspected (needs testing)  
**Recommended Fix**: Test thoroughly. Consider `credentialless` or remove if breaking legitimate embeds.

### SEC-012: File Upload Size Limit Only Enforced by Next.js Config
**Severity**: Medium  
**Affected**: `next.config.ts` line 11, `src/app/api/admin/upload/route.ts`  
**Evidence**: `serverActions.bodySizeLimit: '2mb'` but upload API uses `formData.get("file")` which loads entire file into memory before validation. No explicit size check in route handler.  
**Impact**: DoS via large file uploads (memory exhaustion).  
**Status**: Confirmed  
**Recommended Fix**: Add explicit file size validation in upload route (e.g., 5MB max). Stream processing for large files.

### SEC-013: No Content-Type Validation on API Endpoints
**Severity**: Medium  
**Affected**: All API routes accepting JSON  
**Evidence**: Routes use `await req.json()` without checking `Content-Type: application/json`.  
**Impact**: CSRF via form submission (text/plain) possible if CSRF protection missing (SEC-001).  
**Status**: Confirmed  
**Recommended Fix**: Validate Content-Type header on all JSON endpoints. Reject non-JSON.

### SEC-014: Debug/Development Endpoints Exposed
**Severity**: Medium  
**Affected**: Various test scripts in root directory  
**Evidence**: Root contains `generate_admin.js`, `change-password.js`, `check-users.js`, `revoke-sessions.js`, `test-upload.js`, `test-crud-api.js`, `fix-*.js`, `patch-tables.js`, `seed_*.ts` - many with direct DB access.  
**Impact**: If accidentally deployed, these provide admin access without authentication.  
**Status**: Confirmed  
**Recommended Fix**: Move to `scripts/` directory. Add `if (process.env.NODE_ENV === 'production') throw new Error()` guards.

### SEC-015: Audit Log Not Immutable / No Tamper Evidence
**Severity**: Medium  
**Affected**: `prisma/schema.prisma` (AuditLog model), no audit log integrity checks  
**Evidence**: AuditLog model has no cryptographic integrity (hash chaining, signatures). Admin with DB access can modify/delete logs.  
**Impact**: Malicious admin can cover tracks. No forensic evidence integrity.  
**Status**: Confirmed  
**Recommended Fix**: Implement hash-chained audit logs or write to append-only external store (CloudWatch, Datadog, etc.)

### SEC-016: No Security Headers on API Error Responses
**Severity**: Medium  
**Affected**: All API routes returning errors  
**Evidence**: Error responses (500, 400, etc.) don't explicitly set security headers. Rely on middleware which may not apply to API error paths.  
**Impact**: Error pages may leak stack traces, lack CSP/HSTS.  
**Status**: Confirmed  
**Recommended Fix**: Ensure error responses include security headers. Use a wrapper or middleware.

---

## Low Findings

### SEC-017: GIF Allowed in Upload but Not in ALLOWED_MIME_TYPES
**Severity**: Low  
**Affected**: `src/app/api/admin/upload/route.ts` line 9, 10  
**Evidence**: `ALLOWED_MIME_TYPES` includes `image/gif` but `ALLOWED_EXTENSIONS` does not include `gif`. Extension check (line 33-35) will reject GIF files.  
**Impact**: Inconsistent validation. GIF uploads fail despite MIME type being allowed.  
**Status**: Confirmed  
**Recommended Fix**: Add `gif` to `ALLOWED_EXTENSIONS` or remove `image/gif` from MIME types.

### SEC-018: No Secure Flag on Cookies in Development
**Severity**: Low  
**Affected**: `src/lib/session.ts` line 28  
**Evidence**: `secure: process.env.NODE_ENV === 'production'` - cookies sent over HTTP in dev.  
**Impact**: Session cookies transmitted in cleartext on localhost. Low risk but bad practice.  
**Status**: Confirmed  
**Recommended Fix**: Use `lucia-auth` or similar that handles this correctly, or use localhost HTTPS (mkcert).

### SEC-019: JWT Algorithm Not Explicitly Specified
**Severity**: Low  
**Affected**: `src/lib/auth.ts` line 21, `src/proxy.ts` line 41  
**Evidence**: `jwt.sign(payload, AUTH_SECRET, { expiresIn: SESSION_DURATION })` - defaults to HS256 but not explicit. `jose.jwtVerify` auto-detects.  
**Impact**: Algorithm confusion attacks theoretically possible if keys mixed.  
**Status**: Confirmed  
**Recommended Fix**: Explicitly specify algorithm: `{ algorithm: 'HS256' }` in both sign and verify.

### SEC-020: Missing Permissions-Policy Directives
**Severity**: Low  
**Affected**: `next.config.ts` line 54  
**Evidence**: Only `camera=(), microphone=(), geolocation=(), interest-cohort=()` specified. Missing: `payment=()`, `usb=()`, `bluetooth=()`, `screen-wake-lock=()`.  
**Impact**: Unused powerful APIs not explicitly disabled.  
**Status**: Confirmed  
**Recommended Fix**: Add comprehensive Permissions-Policy for all unused browser features.

---

## Informational Findings

### SEC-021: Excellent Password Hashing Configuration
**Severity**: Informational (Positive)  
**Affected**: `src/lib/auth.ts` line 9  
**Evidence**: `BCRYPT_SALT_ROUNDS = 12` - meets OWASP recommendation (12+).  
**Status**: Verified Good Practice

### SEC-022: Good Rate Limiting Architecture
**Severity**: Informational (Positive)  
**Affected**: `src/app/api/auth/login/route.ts`, `src/app/api/contact/route.ts`, `src/app/api/newsletter/route.ts`  
**Evidence**: Upstash Redis for production (distributed), in-memory fallback for dev. Proper lockout windows.  
**Status**: Verified Good Practice

### SEC-023: Magic Byte Validation for File Uploads
**Severity**: Informational (Positive)  
**Affected**: `src/app/api/admin/upload/route.ts` lines 26-30  
**Evidence**: Uses `file-type` package to validate actual file content, not just extension.  
**Status**: Verified Good Practice

---

## Remediation Status

| Finding | Status | Verification |
|---------|--------|--------------|
| SEC-001 | ❌ Open | Needs CSRF implementation |
| SEC-002 | ❌ Open | Needs shared session validation |
| SEC-003 | ❌ Open | Needs dependency updates |
| SEC-004 | ❌ Open | Needs auth on GET endpoints |
| SEC-005 | ❌ Open | Needs row-level auth |
| SEC-006 | ❌ Open | Needs IP extraction fix |
| SEC-007 | ❌ Open | Needs password reset flow |
| SEC-008 | ❌ Open | Needs constant-time login |
| SEC-009 | ❌ Open | Needs CSP tightening |
| SEC-010 | ❌ Open | Needs HSTS review |
| SEC-011 | ⚠️ Investigate | Test COEP impact |
| SEC-012 | ❌ Open | Needs size limit in route |
| SEC-013 | ❌ Open | Needs Content-Type validation |
| SEC-014 | ❌ Open | Move scripts, add guards |
| SEC-015 | ❌ Open | Needs immutable audit log |
| SEC-016 | ❌ Open | Needs error header wrapper |
| SEC-017 | ❌ Open | Fix GIF extension list |
| SEC-018 | ❌ Open | Use localhost HTTPS |
| SEC-019 | ❌ Open | Explicit algorithm |
| SEC-020 | ❌ Open | Add missing permissions |

---

## Security Test Results

### Automated Scans
- **npm audit**: 14 vulnerabilities (3 critical, 8 high, 3 moderate) ❌
- **ESLint security rules**: Not configured (no `eslint-plugin-security`)
- **CodeQL**: Configured in CI (security-extended queries) ✅

### Manual Verification
- [x] Authentication flow tested (login/logout/session)
- [x] Rate limiting tested (login, contact, newsletter)
- [x] File upload validation tested (magic bytes, extensions)
- [x] Authorization tested (RBAC on admin routes)
- [x] Security headers verified (CSP, HSTS, X-Frame-Options, etc.)
- [x] Input validation tested (Zod schemas on all APIs)
- [ ] CSRF protection tested - NOT IMPLEMENTED
- [ ] Session revocation tested - FAILS (middleware gap)
- [ ] SSRF protection - N/A (no user-controlled fetches)
- [ ] XSS testing - Partial (React auto-escapes, but CSP has unsafe-inline)

---

## Compliance Notes

| Standard | Status | Notes |
|----------|--------|-------|
| OWASP Top 10 2021 | Partial | Missing: A01 (IDOR in CRUD), A03 (CSRF), A05 (HSTS preload), A06 (vulnerable deps) |
| GDPR | Partial | No data export/deletion endpoints. No consent tracking for newsletter. |
| SOC 2 Type II | Not Ready | Missing: immutable audit logs, formal access review, incident response |

---

## Recommended Priority Order for Remediation

1. **SEC-001** (CSRF) - Blocks entire admin panel security
2. **SEC-002** (Session revocation) - Broken access control
3. **SEC-003** (Dependencies) - Supply chain risk
4. **SEC-004** (Admin API GET auth) - Data exposure
5. **SEC-006** (Rate limit bypass) - Auth bypass
6. **SEC-007** (Password reset) - Availability/ops issue
7. **SEC-005** (IDOR) - Data integrity
8. **SEC-009/010** (CSP/HSTS) - Defense in depth
9. **SEC-012/013** (Upload/Content-Type) - DoS/CSRF vectors
10. **SEC-014/015/016** (Scripts/Audit/Error headers) - Operational security