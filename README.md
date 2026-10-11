# Tecrese (formerly Agentverse)

AI Agent & Tool Directory Platform - "Substack meets Awwwards" for the agentic ecosystem.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database (requires ADMIN_EMAIL, ADMIN_PASSWORD in .env)
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📦 Production Deployment

### Prerequisites
1. **PostgreSQL Database** (Supabase, Neon, Railway, etc.) with connection pooling
2. **Vercel Account** for hosting
3. **Vercel Blob** for file storage
4. **Upstash Redis** for distributed rate limiting

### Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string with pgbouncer | ✅ |
| `AUTH_SECRET` | 32+ char random string (`openssl rand -base64 32`) | ✅ |
| `ADMIN_EMAIL` | Admin user email | ✅ |
| `ADMIN_PASSWORD` | Secure admin password | ✅ |
| `NEXT_PUBLIC_SITE_URL` | Production URL (e.g., `https://tecrese.com`) | ✅ |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token | ✅ |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | ✅ |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | ✅ |

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables in Vercel Dashboard
4. Deploy

### Database Migration (Run Once Before First Deploy)
```bash
# Create migration for NewsletterSubscriber.age column
npx prisma migrate dev --name add_newsletter_age

# In CI/CD, use:
npx prisma migrate deploy
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# Unit tests with UI
npm run test:ui

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

## 🔒 Security Features

- **Authentication**: bcrypt(12) + JWT(HS256, 30min) + HTTP-only volatile cookies
- **Authorization**: RBAC (SUPER_ADMIN, EDITOR, AUTHOR, CONTRIBUTOR, REVIEWER)
- **Rate Limiting**: Upstash Redis (prod) / in-memory (dev) - 5 req/15min on auth, 3/hr contact, 5/hr newsletter
- **Security Headers**: CSP, HSTS, X-Frame-Options, COOP, CORP, COEP, Permissions-Policy
- **Input Validation**: Zod schemas on ALL API boundaries
- **File Upload**: Magic byte validation + extension allowlist + Vercel Blob
- **E-E-A-T Masking**: Auto-scrubs "guest poster" → "Contributing Analyst"
- **Link Neutralization**: Auto-nofollow on external links
- **No Tracking**: Self-hosted fonts, no analytics, strict CSP
- **Privacy-Safe IP**: IPs never persisted, only used for rate-limit keys

## 📁 Project Structure

```
├── .github/workflows/     # CI/CD pipeline
├── e2e/                   # Playwright E2E tests
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (public)/      # Public routes
│   │   ├── admin/         # Admin panel (protected)
│   │   ├── api/           # API routes
│   │   └── ...
│   ├── components/        # React components
│   ├── lib/               # Utilities
│   │   ├── auth.ts        # Password hashing, JWT
│   │   ├── session.ts     # Session management
│   │   ├── db.ts          # Prisma client
│   │   ├── rate-limit.ts  # Rate limiting
│   │   ├── validation.ts  # Zod schemas
│   │   └── ...
│   └── ...
├── vitest.config.ts       # Vitest config
├── playwright.config.ts   # Playwright config
└── ...
```

## 🛠 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type check |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to DB |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## 🔐 Admin Access

1. Navigate to `/admin/login`
2. Use credentials from `ADMIN_EMAIL` / `ADMIN_PASSWORD`
3. First login requires password change (`mustChangePassword: true`)

## 📝 License

Private - All rights reserved.