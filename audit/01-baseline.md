# Phase 1: Project Discovery and Baseline Audit

## Detected Architecture and Technology Stack

### Core Framework
- **Next.js 16.3.5** (App Router) with Turbopack
- **React 19.2.8** with React 19 types
- **TypeScript 5.x** with strict mode enabled

### Database & ORM
- **Prisma 6.19.3** with **PostgreSQL** (provider = "postgresql")
- Database schema includes: User, Session, Author, Article, Category, Tag, Agent, Tool, Model, Framework, MCPServer, Company, SecurityAlert, GlossaryTerm, MediaAsset, ExternalLink, InternalLink, Redirect, AuditLog, NewsletterSubscriber, Comparison, Review, ContributorProfile, ContactMessage

### Authentication & Session Management
- **bcryptjs 3.0.3** (12 rounds - OWASP recommended)
- **jsonwebtoken 9.0.3** (HS256, 30-minute expiry)
- **jose 6.2.12** (for middleware token verification)
- HTTP-only, Secure (production), SameSite=lax cookies
- Volatile session cookies (no explicit expiry - deleted on browser close)

### Rate Limiting
- **@upstash/redis 1.38.4** (production: distributed Redis)
- In-memory fallback (development only)
- Login: 5 attempts / 15 min lockout
- Contact: 3 submissions / hour
- Newsletter: 5 subscriptions / hour

### Validation
- **Zod 4.6.5** - schemas on ALL API boundaries

### File Upload
- **file-type 20.0.0** (magic byte validation)
- **@vercel/blob 2.8.0** (production storage)
- Local filesystem fallback (development)
- Allowed: JPEG, PNG, GIF, WebP

### Security Headers (next.config.ts + middleware)
- **CSP**: Strict policy - self-only scripts, no unsafe-eval in production
- **HSTS**: 2 years, includeSubDomains, preload (production only)
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: camera=(), microphone=(), geolocation=(), interest-cohort=()
- **COOP/COEP/CORP**: same-origin / require-corp (production)

### Testing
- **Vitest 3.0.5** (unit/integration tests)
- **Playwright 1.51.1** (E2E tests - Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari)
- **@testing-library/react 16.2.0**, **@testing-library/jest-dom 6.6.3**

### Deployment Target
- **Vercel** (with Vercel Blob for file storage)
- **Upstash Redis** for distributed rate limiting
- **PostgreSQL** with connection pooling (Supabase, Neon, Railway, etc.)

---

## Route and Feature Inventory

### Public Routes (17)
| Route | Type | Description |
|-------|------|-------------|
| `/` | Dynamic | Homepage with featured content |
| `/about` | Static | About page |
| `/about/editorial-policy` | Static | Editorial policy |
| `/agents` | Dynamic | Agent directory listing |
| `/agents/[slug]` | Dynamic | Agent detail page |
| `/tools` | Dynamic | Tool directory listing |
| `/tools/[slug]` | Dynamic | Tool detail page |
| `/models` | Dynamic | Model directory listing |
| `/models/[slug]` | Dynamic | Model detail page |
| `/frameworks` | Dynamic | Framework directory listing |
| `/frameworks/[slug]` | Dynamic | Framework detail page |
| `/mcp-servers` | Dynamic | MCP server directory |
| `/mcp-servers/[slug]` | Dynamic | MCP server detail |
| `/guides` | Dynamic | Guides listing |
| `/guides/[slug]` | Dynamic | Guide detail |
| `/news` | Dynamic | News listing |
| `/news/[slug]` | Dynamic | News article detail |
| `/security` | Dynamic | Security alerts listing |
| `/security/[slug]` | Dynamic | Security alert detail |
| `/build` | Static | Build page |
| `/contributors` | Dynamic | Contributors listing |
| `/authors/[slug]` | Dynamic | Author profile |
| `/contact` | Static | Contact form |
| `/privacy` | Static | Privacy policy |
| `/terms` | Static | Terms of service |
| `/cookies` | Static | Cookie policy |
| `/search` | Dynamic | Search results page |
| `/rss.xml` | Dynamic | RSS feed |
| `/sitemap.xml` | Dynamic | Sitemap |
| `/robots.txt` | Dynamic | Robots.txt |
| `/manifest.webmanifest` | Static | PWA manifest |

### Admin Routes (18) - Protected by Middleware + Session
| Route | Type | Description |
|-------|------|-------------|
| `/admin` | Dynamic | Admin dashboard |
| `/admin/login` | Static | Login page (public) |
| `/admin/articles` | Dynamic | Article management |
| `/admin/agents` | Dynamic | Agent management |
| `/admin/tools` | Dynamic | Tool management |
| `/admin/models` | Dynamic | Model management |
| `/admin/frameworks` | Dynamic | Framework management |
| `/admin/mcp` | Dynamic | MCP server management |
| `/admin/categories` | Dynamic | Category management |
| `/admin/tags` | Dynamic | Tag management |
| `/admin/authors` | Dynamic | Author management |
| `/admin/contributors` | Dynamic | Contributor management |
| `/admin/glossary` | Dynamic | Glossary management |
| `/admin/security` | Dynamic | Security alerts management |
| `/admin/redirects` | Dynamic | Redirect management |
| `/admin/links` | Dynamic | Internal/external link management |
| `/admin/media` | Dynamic | Media library |
| `/admin/seo` | Dynamic | SEO dashboard |
| `/admin/settings` | Dynamic | Site settings |
| `/admin/users` | Dynamic | User management |
| `/admin/audit` | Dynamic | Audit log |
| `/admin/[...slug]` | Dynamic | Catch-all for nested admin routes |

### API Endpoints (21)
| Endpoint | Methods | Auth | Description |
|----------|---------|------|-------------|
| `/api/auth/login` | POST | Public | User login |
| `/api/auth/logout` | POST | Auth | User logout |
| `/api/admin/me` | GET | Admin | Current user info |
| `/api/admin/crud` | GET, POST, PUT, DELETE | Editor+ | Generic CRUD |
| `/api/admin/articles` | GET, POST | Editor+ | Article CRUD |
| `/api/admin/agents` | GET, POST | Editor+ | Agent CRUD |
| `/api/admin/tools` | GET, POST | Editor+ | Tool CRUD |
| `/api/admin/models` | GET, POST | Editor+ | Model CRUD |
| `/api/admin/categories` | GET, POST | Editor+ | Category CRUD |
| `/api/admin/glossary` | GET, POST | Editor+ | Glossary CRUD |
| `/api/admin/redirects` | GET, POST | Editor+ | Redirect CRUD |
| `/api/admin/security-alerts` | GET, POST | Editor+ | Security alerts CRUD |
| `/api/admin/upload` | POST | Author+ | File upload |
| `/api/admin/articles/[id]/auto-link` | POST | Editor+ | Auto-linking |
| `/api/contact` | POST | Public (rate-limited) | Contact form |
| `/api/newsletter` | POST | Public (rate-limited) | Newsletter signup |
| `/api/search` | GET | Public | Search API |
| `/api/health` | GET | Public | Health check |

---

## Key User Journeys

1. **Anonymous User**: Browse agents/tools/models/guides/news → Search → Contact form → Newsletter signup
2. **Authenticated Admin**: Login → Dashboard → Manage content (CRUD) → Upload media → View analytics
3. **Content Workflow**: Draft → Submit → Review → Approve → Schedule → Publish

---

## External Dependencies

| Service | Purpose | Configuration |
|---------|---------|---------------|
| PostgreSQL | Primary database | `DATABASE_URL`, `DIRECT_URL` |
| Vercel Blob | File storage | `BLOB_READ_WRITE_TOKEN` |
| Upstash Redis | Rate limiting | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| Vercel | Hosting | Project linked via GitHub |

---

## Existing Scripts and Tests

### Package.json Scripts
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:ui": "vitest --ui",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:migrate": "prisma migrate dev",
  "db:seed": "npx tsx prisma/seed.ts",
  "db:studio": "prisma studio",
  "db:reset": "prisma migrate reset"
}
```

### Test Structure
- **Unit tests**: `src/lib/__tests__/*.test.ts` (4 test files)
- **API integration tests**: `src/app/api/__tests__/*.test.ts` (8 test files)
- **E2E tests**: `e2e/app.spec.ts`

---

## Initial Build and Test Results

### Build ✅
```
npm run build
✓ Compiled successfully in 1195ms
✓ TypeScript check passed
✓ 33 static pages generated
✓ All routes compiled successfully
```

### Type Check ✅
```
npm run typecheck
✓ No errors
```

### Lint ❌ (131 errors, 87 warnings)
Major categories:
- `@typescript-eslint/no-explicit-any` (71 occurrences) - widespread use of `any` type
- `react-hooks/set-state-in-effect` (12 occurrences) - setState called directly in useEffect
- `react-hooks/exhaustive-deps` (2 occurrences) - missing dependencies
- `react-hooks/purity` (1 occurrence) - Date.now() in render
- `@typescript-eslint/no-require-imports` (6 occurrences) - require() in test files
- `@next/next/no-img-element` (11 warnings) - <img> instead of <Image />
- `react/no-unescaped-entities` (6 occurrences)

### Unit Tests ❌ (31 failed, 47 passed)
**Failures by category:**

| Test File | Failed | Passed | Issues |
|-----------|--------|--------|--------|
| `session.test.ts` | 9 | 0 | Mock setup incorrect, NEXT_REDIRECT not handled |
| `auth.test.ts` | 1 (compile) | 6 | `await` at top level in test |
| `validation.test.ts` | 1 | 24 | searchSchema min query length not enforced |
| `login.route.test.ts` | 1 | 3 | Invalid password returns 200 instead of 401 |
| `crud.route.test.ts` | 1 | 5 | Forbidden thrown instead of 401 |
| `health.route.test.ts` | 2 | 0 | db.$queryRaw not mocked |
| `contact.route.test.ts` | 3 | 0 | FormData parsing fails in test environment |
| `newsletter.route.test.ts` | 6 | 0 | FormData parsing fails in test environment |
| `upload.route.test.ts` | 3 | 1 | FormData parsing fails in test environment |
| `upload.magic-bytes.test.ts` | 5 | 0 | FormData parsing fails in test environment |

**Root cause of most failures**: Test infrastructure doesn't properly handle Next.js Request/Response with FormData or middleware redirects.

---

## Missing Configuration / Unavailable Services

| Item | Status | Notes |
|------|--------|-------|
| `.env` file | ❌ Not present | `.env.example` referenced in README but doesn't exist |
| `.env.example` | ❌ Not present | Required for onboarding |
| Production database | ⚠️ External | Requires PostgreSQL with pgbouncer |
| Vercel Blob | ⚠️ External | Requires Vercel account |
| Upstash Redis | ⚠️ External | Requires Upstash account |
| CI/CD secrets | ⚠️ External | GitHub secrets needed for deployment |

---

## Initial Risks and Areas Requiring Deeper Investigation

### Critical
1. **Test Infrastructure Broken**: 31/78 tests failing - CI will fail
2. **Missing .env.example**: Cannot onboard new developers or verify config
3. **Middleware vs Session Double-Check**: Both `proxy.ts` (middleware) and `session.ts` validate auth - potential inconsistency

### High
1. **No CSRF Protection**: No CSRF tokens on forms (login, contact, newsletter, admin CRUD)
2. **Session Validation Gap**: Middleware (`proxy.ts`) validates JWT cryptographically but doesn't check database for revoked sessions
3. **CSP 'unsafe-inline'**: Required for Next.js but weakens XSS protection
3. **FormData Test Failures**: API routes accepting FormData can't be tested properly

### Medium
1. **Lint Errors**: 131 errors indicate code quality issues
2. **Any Types**: 71 explicit `any` types reduce type safety
3. **React Hooks Violations**: 15 instances of setState in effects / purity issues
4. **Dependency Vulnerabilities**: 14 vulnerabilities (3 critical, 8 high, 3 moderate)
5. **No .env.example**: Deployment documentation references file that doesn't exist

### Low
1. **Image Optimization**: 11 instances of `<img>` instead of `<Image />`
2. **Unescaped Entities**: 6 instances in JSX
3. **Unused Variables**: Multiple warnings

---

## Phase 1 Verdict

**Baseline Status**: Application builds and type-checks successfully, but has significant test failures, lint errors, and missing configuration files. The security architecture is well-designed with proper authentication, rate limiting, validation, and security headers, but there are implementation gaps (CSRF, session revocation check in middleware) and test infrastructure issues that need resolution before production deployment.