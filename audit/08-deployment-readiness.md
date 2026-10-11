# Phase 8: Production Build and Deployment Readiness

## Environment Configuration

### Required Environment Variables

| Variable | Description | Required | Public/Secret | Example |
|----------|-------------|----------|---------------|---------|
| `DATABASE_URL` | PostgreSQL connection string (pooled) | ✅ | Secret | `postgresql://user:pass@host:5432/db?pgbouncer=true` |
| `DIRECT_URL` | PostgreSQL direct connection (migrations) | ✅ | Secret | `postgresql://user:pass@host:5432/db` |
| `AUTH_SECRET` | JWT signing secret (32+ chars) | ✅ | Secret | `openssl rand -base64 32` |
| `ADMIN_EMAIL` | Initial admin email | ✅ | Secret | `admin@tecrese.com` |
| `ADMIN_PASSWORD` | Initial admin password | ✅ | Secret | Secure random |
| `NEXT_PUBLIC_SITE_URL` | Production URL | ✅ | Public | `https://tecrese.com` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token | ✅ | Secret | `vercel_blob_rw_...` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | ✅ | Secret | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | ✅ | Secret | `xxxx` |

### Current `.env` (Development)
```env
DATABASE_URL="file:./dev.db"          # ❌ SQLite - production needs PostgreSQL
DIRECT_URL="file:./dev.db"            # ❌ SQLite
AUTH_SECRET="dev-super-secret-v2..."  # ⚠️ Dev value
ADMIN_EMAIL="admin@tecrese.com"       # ✅
ADMIN_PASSWORD="change-this-password" # ⚠️ Weak dev password
NEXT_PUBLIC_SITE_URL="https://tecrese.com"  # ✅
BLOB_READ_WRITE_TOKEN=""              # ❌ Empty - local fallback
UPSTASH_REDIS_REST_URL=""             # ❌ Empty - in-memory fallback
UPSTASH_REDIS_REST_TOKEN=""           # ❌ Empty
```

### `.env.example` Status
✅ **Exists** with all required variables documented and placeholder values.

### Production Validation (Code Review)

| Check | Code Location | Status |
|-------|---------------|--------|
| AUTH_SECRET enforced in prod | `src/lib/auth.ts:5-7`, `src/proxy.ts:5-8` | ✅ Throws if default |
| ADMIN_PASSWORD enforced in prod | `prisma/seed.ts:12-14` | ✅ Throws if missing |
| Debug mode disabled | `next.config.ts` - no `reactStrictMode: false` | ✅ |
| Source maps in production | Not explicitly disabled | ⚠️ Verify Vercel settings |
| Console.log in production | `src/lib/logger.ts` - JSON in prod | ✅ Structured logging |

---

## Production Build

### Build Command
```bash
npm run build
```

### Build Result (Verified)
```
✓ Compiled successfully in 1195ms
✓ TypeScript check passed
✓ 33 static pages generated
✓ All routes compiled successfully
```

### Build Output Analysis
| Metric | Value | Target |
|--------|-------|--------|
| Build time | ~1.2s | < 5 min |
| TypeScript errors | 0 | 0 |
| ESLint errors | 131 (pre-build) | 0 |
| Static pages (○) | 13 | N/A |
| Dynamic pages (ƒ) | 20 | N/A |
| First Load JS (avg) | ~185 KB | < 170 KB |

### Build-Time Requirements
- **DATABASE_URL**: Required for Prisma Client generation
- **AUTH_SECRET**: Required for middleware compilation
- **NEXT_PUBLIC_SITE_URL**: Required for sitemap/robots generation

### Vercel Build Configuration
```json
// vercel.json (not present - uses defaults)
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "nextjs"
}
```

---

## Hosting & Deployment

### Target Platform: Vercel
- **Framework**: Next.js 16.3.5 (App Router)
- **Runtime**: Node.js 20.x
- **Regions**: Default (auto)
- **Functions**: Serverless (default)

### Required Vercel Configuration
1. **Environment Variables**: All 9 required vars in Vercel Dashboard
2. **Storage**: 
   - Vercel Blob (for uploads)
   - Vercel Postgres / External (Neon, Supabase, Railway)
3. **Redis**: Upstash (external, not Vercel KV)
4. **Domains**: `tecrese.com` + `www.tecrese.com`

### DNS & TLS
| Requirement | Status | Notes |
|-------------|--------|-------|
| Custom domain | ⚠️ Not configured | Add in Vercel Dashboard |
| www redirect | ⚠️ Not configured | Configure in DNS/Vercel |
| HTTPS enforcement | ✅ Code-level (HSTS) | Vercel provides TLS |
| HSTS preload | ⚠️ Enabled in code | Verify domain readiness first |
| CAA records | ❌ Not checked | Recommended for security |

### Static vs Dynamic Deployment
| Route Type | Routes | Deployment |
|------------|--------|------------|
| Static (○) | 13 | Edge CDN (fast) |
| Dynamic (ƒ) | 20 | Serverless Functions |
| API Routes | 21 | Serverless Functions |
| ISR | 0 | Not configured |

---

## Runtime Compatibility

### Node.js Version
- **Required**: 20.x (per `package.json` engines not specified, CI uses 20.x)
- **Vercel Default**: 20.x ✅

### Package Manager
- **Lockfile**: `package-lock.json` ✅
- **CI Command**: `npm ci` ✅
- **Postinstall**: `prisma generate` ✅

### Dependency Compatibility
| Package | Version | Node 20 Compatible |
|---------|---------|-------------------|
| `next` | 16.3.5 | ✅ |
| `react` | 19.2.8 | ✅ |
| `prisma` | 6.19.3 | ✅ |
| `@prisma/client` | 6.19.3 | ✅ |
| `vitest` | 3.0.5 | ✅ |
| `playwright` | 1.51.1 | ✅ |

---

## Pre-Deployment Checklist

### Code Quality
- [ ] Fix 131 ESLint errors
- [ ] Fix 31 failing unit tests
- [ ] Remove `any` types (71 occurrences)
- [ ] Fix React hooks violations (12 instances)

### Security
- [ ] Implement CSRF protection (SEC-001)
- [ ] Fix session revocation in middleware (SEC-002)
- [ ] Update vulnerable dependencies (SEC-003)
- [ ] Add auth to admin GET endpoints (SEC-004)
- [ ] Fix IDOR in CRUD API (SEC-005)
- [ ] Fix rate limit IP spoofing (SEC-006)

### Configuration
- [ ] Provision PostgreSQL (Neon/Supabase/Railway)
- [ ] Provision Vercel Blob storage
- [ ] Provision Upstash Redis
- [ ] Generate production `AUTH_SECRET` (`openssl rand -base64 32`)
- [ ] Set secure `ADMIN_PASSWORD`
- [ ] Configure custom domain in Vercel
- [ ] Verify HSTS preload readiness
- [ ] Remove `preload` from HSTS if subdomains not ready

### Database
- [ ] Run `prisma migrate deploy` on production DB
- [ ] Verify connection pooling (pgbouncer)
- [ ] Seed production database
- [ ] Test backup/restore procedure

### Monitoring
- [ ] Configure error tracking (Sentry/LogRocket)
- [ ] Configure analytics (Plausible/PostHog - optional)
- [ ] Set up uptime monitoring
- [ ] Configure log aggregation

---

## Deployment Process

### Automated (CI/CD - `.github/workflows/ci.yml`)
```yaml
# Current pipeline:
1. Lint & TypeCheck
2. Unit Tests
3. Security Audit (npm audit + CodeQL)
4. Build
5. Deploy Preview (PRs)
6. Deploy Production (main branch)
```

### Manual Steps Required
1. **First Deploy Only**: Run `prisma migrate deploy` on production DB
2. **Environment Variables**: Add all 9 secrets in Vercel Dashboard
3. **Domain Configuration**: Add `tecrese.com` in Vercel, configure DNS
4. **Storage**: Enable Vercel Blob, configure Upstash Redis
5. **Smoke Test**: Run post-deployment checks

### Rollback Procedure
```bash
# Vercel CLI rollback
vercel rollback <deployment-url> --token=$VERCEL_TOKEN

# Or via Dashboard: Deployments → ... → Rollback

# Database rollback (if migration failed):
# 1. Restore DB from backup
# 2. Redeploy previous commit
```

---

## Post-Deployment Smoke Tests

### Automated (Add to CI/CD)
```bash
# Health check
curl -f https://tecrese.com/api/health

# Critical pages
curl -f https://tecrese.com/
curl -f https://tecrese.com/admin/login
curl -f https://tecrese.com/agents
curl -f https://tecrese.com/tools

# Auth flow
# 1. Login with admin credentials
# 2. Access /admin dashboard
# 3. Create test article
# 4. Verify public visibility
```

### Manual Verification
- [ ] Homepage loads with content
- [ ] Admin login works
- [ ] Article CRUD works
- [ ] File upload works (Vercel Blob)
- [ ] Rate limiting works (Upstash Redis)
- [ ] Search works
- [ ] Contact form submits
- [ ] Newsletter signup works
- [ ] Security headers present
- [ ] HTTPS enforced
- [ ] Custom domain resolves
- [ ] 404 page works
- [ ] RSS/sitemap/robots accessible

---

## Configuration Drift Prevention

### Infrastructure as Code
- **Missing**: No Terraform/Pulumi for Vercel/Upstash/DB
- **Current**: Manual dashboard configuration
- **Recommendation**: Document all settings in `INFRASTRUCTURE.md`

### Environment Parity
| Environment | Database | Blob | Redis | Domain |
|-------------|----------|------|-------|--------|
| Development | SQLite (local) | Local FS | In-memory | localhost:3000 |
| Preview | Preview DB | Preview Blob | Preview Redis | *.vercel.app |
| Production | **PostgreSQL** | **Vercel Blob** | **Upstash** | **tecrese.com** |

**Risk**: Significant parity gaps between dev and prod.

---

## Summary: Deployment Readiness

| Area | Status | Blockers |
|------|--------|----------|
| Build | ✅ Passes | None |
| Type Check | ✅ Passes | None |
| Lint | ❌ 131 errors | Must fix |
| Unit Tests | ❌ 31 fail | Must fix |
| Security | ❌ Critical issues | SEC-001 through SEC-008 |
| Dependencies | ❌ 14 vulns | Update packages |
| Environment Config | ⚠️ Template exists | Provision services |
| Database | ⚠️ Schema ready | Provision PostgreSQL |
| CI/CD | ✅ Configured | Needs passing tests |
| Domain/TLS | ❌ Not configured | Vercel setup |
| Monitoring | ❌ Not configured | Add Sentry/etc. |

**Verdict**: **NOT READY FOR PRODUCTION DEPLOYMENT**

**Minimum to Deploy**:
1. Fix all ESLint errors
2. Fix all failing tests
3. Resolve Critical/High security findings
4. Provision production services
5. Configure domain and TLS
6. Run smoke tests