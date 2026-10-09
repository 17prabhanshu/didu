# Tecrese (formerly Agentverse) - Complete Project Context

## Project Overview
Tecrese is a high-performance, SEO-optimized directory and intelligence platform for discovering AI agents, models, developer tools, and industry news. Built to be a "Substack meets Awwwards" platform, it seamlessly masks guest posting features into a strict "Editorial E-E-A-T" architecture to maximize Google Search authority.

## Technology Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** Prisma ORM (currently SQLite for local dev, fully prepped for PostgreSQL/Prisma Accelerate connection pooling)
- **Styling:** Tailwind CSS + Framer Motion (Glassmorphism, custom UI elements without generic SaaS templates)
- **Authentication:** Custom Zero-Trust JWT HTTP-only Cookies (Volatile sessions)
- **Infrastructure Integrations:** @vercel/blob (Media Storage), @upstash/redis (Distributed Rate Limiting)

## Core Features Implemented

### 1. Intelligent Content Management System (CMS)
- **Universal Form Engine:** A dynamic UI that maps directly to the Prisma DMMF, automatically rendering inputs, selects, and relations based on the database schema.
- **Server-Side Fallbacks:** The CRUD API automatically handles missing data (auto-generating URL slugs, injecting default `authorId`s, and defaulting status to `DRAFT`).
- **Contact & Newsletter Inbox:** Both frontend forms are fully wired to the backend database, allowing admins to read user messages and subscriber lists directly in the Admin Panel without needing an external email client.

### 2. Global Command Palette (Cmd+K)
- A custom, fully-wired fuzzy search engine.
- Pressing `Cmd+K` anywhere on the site opens a floating search modal.
- It asynchronously queries the `/api/search` route to find Agents, Tools, Models, and News articles concurrently, returning interactive results.

### 3. SEO & "Helpful Content" Masking (E-E-A-T)
- **Guest-Post Cloaking:** The backend API automatically intercepts submitted bios and articles, scrubbing terms like "guest poster" or "sponsored" and replacing them with highly-credible alternatives like "Contributing Analyst" and "independent research".
- **Link Neutralization:** The API automatically forces `rel="nofollow noopener noreferrer"` on all external links inside content bodies to prevent SEO spam farm penalties.
- **Structured Data:** Full JSON-LD schema injection (NewsMediaOrganization, NewsArticle, etc.) is mapped globally in the public layouts.

### 4. Serverless Edge Architecture
- **Distributed Rate Limiting:** The Auth API falls back to an in-memory map for local development but intelligently switches to Upstash Redis when Vercel env vars are detected, preventing brute-force attacks across edge nodes.
- **Persistent Media Storage:** The `/api/admin/upload` route uses the local file system during `npm run dev` but switches to Vercel Blob API for persistent cloud storage in production.

## Database Schema (Key Models)
- `User` & `Session`: Authentication and role-based access control.
- `Article` & `Author`: News, guides, and research pieces.
- `Agent`, `Tool`, `Model`: The core directory entities.
- `ContactMessage` & `NewsletterSubscriber`: Fully integrated community outreach tables.

## Deployment Readiness
The entire codebase has had its domain references migrated to `tecrese.com`. It is 100% ready to be pushed to Vercel. Upon deployment, simply provide the `DATABASE_URL` (Postgres), `BLOB_READ_WRITE_TOKEN`, and `UPSTASH_REDIS_REST_URL`.

## Security & Privacy Hardening (Launch Pass)
- **Self-hosted fonts:** All three families (Syne, Plus Jakarta Sans, JetBrains Mono) are
  loaded via `next/font/local` from committed woff2 files in `src/app/fonts/`. The app
  makes **zero** requests to Google Fonts at build or runtime, so no visitor IP reaches
  a third party.
- **No analytics / session replay:** No tracking scripts are installed. Strict CSP
  (`default-src 'self'`, no third-party origins) actively prevents any from being added.
- **Hardened HTTP headers** (`next.config.ts` + middleware): Content-Security-Policy,
  HSTS (`preload`), X-Frame-Options DENY, X-Content-Type-Options nosniff,
  Referrer-Policy, Permissions-Policy (incl. `interest-cohort=()`), X-DNS-Prefetch-Control off.
- **IP handling:** `src/lib/request-ip.ts` derives a validated rate-limit identifier from
  `x-forwarded-for` (first hop) / `x-real-ip` / `cf-connecting-ip`. IPs are used ONLY as
  rate-limit keys — never stored, returned, or logged.
- **No info leaks:** Login/CRUD error handlers no longer return raw `error.message` to clients.
- **Newsletter signup requires age** (validated 13–120, persisted on `NewsletterSubscriber.age`).
- **Production secrets:** `.env` is gitignored. `AUTH_SECRET` MUST be set to a strong random
  value in the Vercel environment (the app throws on boot in production if left at the dev default).
- **Prod DB:** Run `prisma migrate dev` (not `db push`) to generate the Postgres migration for
  the new `NewsletterSubscriber.age` column before deploying.
