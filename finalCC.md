# Final Production Readiness Checklist

**Project**: Agentverse / Tecrese  
**Status**: Conditional Go → Target: Full Production Ready  
**Generated**: 2026-10-11  
**Location**: `/Users/prabhanshushekhar/Desktop/DiDi/finalCC.md`

---

## 🎯 Goal

Transform from **Conditional Go** to **Full Production Ready** by completing all blocking and high-priority items.

---

## 🔴 BLOCKING - Must Complete Before Deploy

### 1. Provision Production Infrastructure

| Task | Status | Details | Done |
|------|--------|---------|------|
| **1.1 Provision PostgreSQL** | ☐ | Create DB on Neon/Supabase/Railway<br>Get `DATABASE_URL` (with pgbouncer) + `DIRECT_URL` | ☐ |
| **1.2 Provision Vercel Blob** | ☐ | Vercel Dashboard → Storage → Create Blob store<br>Copy `BLOB_READ_WRITE_TOKEN` | ☐ |
| **1.3 Provision Upstash Redis** | ☐ | Upstash Console → Create Redis DB<br>Copy `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | ☐ |
| **1.4 Generate Secrets** | ☐ | `AUTH_SECRET`: `openssl rand -base64 32`<br>`ADMIN_PASSWORD`: Secure random (24+ chars) | ☐ |

### 2. Configure Vercel

| Task | Status | Details | Done |
|------|--------|---------|------|
| **2.1 Add Environment Variables** | ☐ | Vercel Dashboard → Settings → Environment Variables<br>Add all 9 variables for Production environment | ☐ |
| **2.2 Add Custom Domain** | ☐ | Vercel → Domains → Add `tecrese.com`<br>Configure DNS: A record (76.76.21.21) + CNAME (cname.vercel-dns.com) | ☐ |
| **2.3 Verify HTTPS/TLS** | ☐ | Confirm certificate issued, HSTS working | ☐ |

### 3. Database Setup

| Task | Status | Command | Done |
|------|--------|---------|------|
| **3.1 Run Migrations** | ☐ | `npx prisma migrate deploy` (against production DB) | ☐ |
| **3.2 Seed Production Data** | ☐ | `npx tsx prisma/seed.ts` (with production env) | ☐ |
| **3.3 Verify Connection Pooling** | ☐ | Confirm pgbouncer working, no connection errors | ☐ |

---

## 🟡 HIGH PRIORITY - Must Complete Before Launch

### 4. Testing & Verification

| Task | Status | Command | Done |
|------|--------|---------|------|
| **4.1 Deploy to Preview** | ☐ | `vercel --prod=false` | ☐ |
| **4.2 Run E2E Tests on Preview** | ☐ | `npm run test:e2e` against preview URL | ☐ |
| **4.3 Manual Smoke Tests** | ☐ | See [Post-Deploy Verification](#post-deploy-verification) | ☐ |
| **4.4 Verify Security Headers** | ☐ | `curl -I https://preview-url.vercel.app` | ☐ |

### 5. Monitoring Setup

| Task | Status | Details | Done |
|------|--------|---------|------|
| **5.1 Error Tracking** | ☐ | Add Sentry DSN to Vercel env vars | ☐ |
| **5.2 Uptime Monitoring** | ☐ | UptimeRobot/Pingdom → Monitor `https://tecrese.com/api/health` | ☐ |
| **5.3 Log Aggregation** | ☐ | Vercel Logs + external (optional) | ☐ |

### 6. Critical Code Fixes

| Task | Status | Files | Done |
|------|--------|-------|------|
| **6.1 Fix CLS - Replace `<img>` with `<Image />`** | ☐ | 11 locations flagged by lint | ☐ |
| **6.2 Add Focus Traps** | ☐ | `src/components/ui/dialog.tsx`, `src/components/ui/dropdown-menu.tsx` | ☐ |
| **6.3 Toast Accessibility** | ☐ | `src/components/ui/toast.tsx` - add `role="alert"` | ☐ |

---

## 🟢 MEDIUM PRIORITY - Schedule in First Sprint

| Task | Status | Effort | Done |
|------|--------|--------|------|
| **7.1 GDPR Export/Delete Endpoints** | ☐ | Medium | ☐ |
| **7.2 Backup/Restore Documentation** | ☐ | Low | ☐ |
| **7.3 Add Migrations to Git** | ☐ | Low (remove from `.gitignore`) | ☐ |
| **7.4 Transaction Wrapper for Multi-Table Ops** | ☐ | Medium | ☐ |
| **7.5 Reduced Motion CSS** | ☐ | Low | ☐ |
| **7.6 Bundle Analyzer in CI** | ☐ | Low | ☐ |

---

## 📋 Post-Deploy Verification (Run Immediately After Production Deploy)

```bash
# Automated checks
curl -f https://tecrese.com/api/health
curl -f https://tecrese.com/
curl -f https://tecrese.com/admin/login
curl -f https://tecrese.com/agents
curl -f https://tecrese.com/tools

# Manual verification (5 min)
# 1. Visit https://tecrese.com - verify homepage loads
# 2. Visit https://tecrese.com/admin/login - login with admin credentials
# 3. Verify admin dashboard loads
# 4. Create test article → verify public visibility
# 5. Test contact form submission
# 6. Test newsletter signup (with age validation)
# 7. Verify file upload works (Vercel Blob)
# 8. Check browser console for errors
# 9. Verify security headers (CSP, HSTS, X-Frame-Options, etc.)
# 10. Test logout → verify session destroyed
```

---

## 🔄 Rollback Procedure

```bash
# Quick rollback (Vercel)
vercel rollback <deployment-url> --token=$VERCEL_TOKEN

# Or via Dashboard: Deployments → Previous working → ... → Rollback

# Database rollback (if migration failed)
# 1. Restore DB from provider backup (point-in-time)
# 2. Redeploy previous commit
```

---

## 📦 Environment Variables Reference

### Required (9 total)

| Variable | Source | Example |
|----------|--------|---------|
| `DATABASE_URL` | PostgreSQL provider | `postgresql://user:pass@host:5432/db?pgbouncer=true` |
| `DIRECT_URL` | PostgreSQL provider | `postgresql://user:pass@host:5432/db` |
| `AUTH_SECRET` | Generate | `openssl rand -base64 32` |
| `ADMIN_EMAIL` | You | `admin@tecrese.com` |
| `ADMIN_PASSWORD` | Generate | Secure random 24+ chars |
| `NEXT_PUBLIC_SITE_URL` | You | `https://tecrese.com` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob | `vercel_blob_rw_...` |
| `UPSTASH_REDIS_REST_URL` | Upstash | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash | `xxxx` |

---

## 🚀 Deployment Commands

```bash
# 1. Generate secrets
openssl rand -base64 32   # AUTH_SECRET
openssl rand -base64 24   # ADMIN_PASSWORD

# 2. After adding env vars to Vercel, deploy preview
vercel --prod=false

# 3. Run migrations on production DB
npx prisma migrate deploy

# 4. Seed production
npx tsx prisma/seed.ts

# 5. Run E2E against preview
npm run test:e2e

# 6. If all green, deploy production
vercel --prod=true
```

---

## ✅ Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| Security Review | | | |
| DevOps/Release | | | |
| Product Owner | | | |

---

## 📁 Related Audit Files

All detailed findings in `/Users/prabhanshushekhar/Desktop/DiDi/agentverse/audit/`:
- `01-baseline.md` - Architecture & baseline
- `02-security.md` - Security findings (23 total, 21 fixed)
- `03-functional-qa.md` - Route & functional testing
- `04-accessibility-responsive.md` - A11y & responsive issues
- `05-performance.md` - Performance analysis
- `06-code-quality.md` - Lint, types, tests
- `07-data-integrity.md` - Database & data integrity
- `08-deployment-readiness.md` - Deployment config
- `09-remediation-log.md` - All fixes applied
- `FINAL-PRODUCTION-READINESS.md` - Final verdict

---

## 🎯 Definition of Done (Full Production Ready)

- [ ] All **🔴 BLOCKING** items complete
- [ ] All **🟡 HIGH PRIORITY** items complete
- [ ] E2E tests passing on staging
- [ ] Custom domain live with HTTPS
- [ ] Monitoring configured and alerting
- [ ] Post-deploy smoke tests pass
- [ ] Rollback tested and documented
- [ ] Team notified and runbook accessible

---

**Once all 🔴 and 🟡 items are checked, the application is FULL PRODUCTION READY.**