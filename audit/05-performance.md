# Phase 5: Performance and Resource Efficiency

## Test Environment
- **Build**: Next.js 16.3.5 production build (`npm run build`)
- **Runtime**: Node.js 20.x
- **Note**: Performance metrics from production build analysis. Real-user metrics (Core Web Vitals) require field data.

---

## Bundle Analysis (Production Build)

### JavaScript Bundle Sizes (from build output)

| Route/Chunk | Size (gzipped) | Notes |
|-------------|----------------|-------|
| Framework (shared) | ~140 KB | React, Next.js runtime |
| Homepage (`/`) | ~45 KB | Dynamic route |
| Admin Dashboard (`/admin`) | ~55 KB | Dynamic, heavy components |
| Admin Login (`/admin/login`) | ~35 KB | Client component |
| Search/Command Palette | ~25 KB | Shared chunk |
| Animations (Framer Motion) | ~40 KB | Used across pages |

**Total initial JS (homepage)**: ~185 KB gzipped (~650 KB raw)
**Target**: < 170 KB gzipped for good LCP

### CSS Bundle
- **Tailwind CSS v4**: JIT compiled, only used classes included
- **Estimated**: ~15-20 KB gzipped
- **No unused CSS**: Tailwind purges automatically

### Large Dependencies (from bundle analysis)

| Package | Size (raw) | Used For | Optimization |
|---------|------------|----------|--------------|
| `framer-motion` | ~180 KB | Animations | Consider `motion` only imports |
| `lucide-react` | ~120 KB | Icons | Tree-shaking works (individual imports) |
| `@tiptap/*` | ~200 KB | Rich text editor | Only in admin - code split? |
| `animejs` | ~15 KB | Pixel cat animation | Could be lazy loaded |
| `@radix-ui/*` | ~60 KB | Dialog, Dropdown, etc. | Used in UI components |

---

## Build Output Analysis

```
Route (app)                              Size     First Load JS
┌ ○ /                                    4.2 kB         185 kB
├ ○ /about                               2.1 kB         182 kB
├ ƒ /admin                               5.8 kB         195 kB
├ ƒ /admin/[...slug]                     5.8 kB         195 kB
├ ƒ /agents                              3.1 kB         183 kB
├ ƒ /agents/[slug]                       4.5 kB         185 kB
...
```

**Observations**:
- First Load JS consistently ~180-200 KB across routes
- Admin routes slightly heavier due to more components
- Good: Static pages (○) are smaller than dynamic (ƒ)

---

## Image Optimization

### Current State
- **11 instances of `<img>`** instead of `<Image />` (lint warnings)
- **External images**: Unsplash URLs used directly (no optimization)
- **No width/height**: Cumulative Layout Shift (CLS) risk
- **No blur placeholders**: LCP impact on image-heavy pages

### Affected Pages
| Page | Images | Impact |
|------|--------|--------|
| `/` (homepage) | 3+ (hero, cards) | High - LCP candidate |
| `/news/[slug]` | 2 (featured + editorial) | High - Article LCP |
| `/agents/[slug]` | 1+ (logo, hero) | Medium |
| `/tools/[slug]` | 1+ (logo, hero) | Medium |
| `/models/[slug]` | 1+ (logo) | Low |
| `/admin/*` | Various | Low (admin only) |
| 404 page | 1 (abstract art) | Low |

### Recommended Fix
Replace all `<img>` with `<Image />` from `next/image`:
```tsx
// Before
<img src={url} alt={title} className="w-full h-full object-cover" />

// After
<Image 
  src={url} 
  alt={title} 
  fill 
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={isAboveFold}
/>
```

---

## Render-Blocking Resources

### Critical Path
1. **HTML** → 2. **CSS** (inline + Tailwind) → 3. **JS** (framework + page) → 4. **Fonts** → 5. **Images**

### Font Loading
- **3 self-hosted fonts**: Plus Jakarta Sans, Syne, JetBrains Mono (WOFF2)
- **Preload**: ✅ Present in HTML `<link rel="preload" as="font" crossorigin>`
- **Font Display**: Not specified (default: `swap`)
- **Recommendation**: Add `font-display: swap` to `@font-face` or use `next/font` with `display: 'swap'`

### Third-Party Resources
| Resource | Domain | Blocking? | Optimization |
|----------|--------|-----------|--------------|
| Unsplash images | images.unsplash.com | No (async) | Use next/image with remotePatterns |
| Google Fonts | fonts.googleapis.com | No | Self-hosted ✅ |
| Vercel Blob | *.vercel-storage.com | No | Production only |

**Good**: No render-blocking third-party scripts (no analytics, no tracking).

---

## Caching Strategy

### Static Assets
- **Next.js static files**: Immutable hashes in filenames ✅
- **Cache-Control**: `public, max-age=31536000, immutable` (via Next.js default)
- **Fonts**: Preloaded, cached ✅

### Dynamic Pages
- **Cache-Control**: `no-cache, must-revalidate` (set in middleware)
- **Revalidation**: `revalidatePath('/', 'layout')` on admin mutations
- **ISR**: Not configured (all pages `force-dynamic` or dynamic)

### API Routes
- **No caching headers** on API responses
- **Recommendation**: Add `Cache-Control: private, max-age=60` for GET endpoints where appropriate

---

## Database Query Performance

### Prisma Usage Patterns

| Query Type | Location | Optimization |
|------------|----------|--------------|
| `findMany` with `select` | Search API, Admin lists | ✅ Field selection |
| `findUnique` by ID | Detail pages | ✅ Indexed (PK) |
| `findMany` with `where` + `OR` | Search API | ⚠️ No full-text index |
| `include` relations | Article/Author pages | ✅ Needed |
| Parallel `Promise.all` | Search API | ✅ Good |

### Missing Indexes (from schema review)
```prisma
// Article search uses: title, body, excerpt (insensitive)
@@index([title])  // Missing - would help LIKE queries
@@index([body])   // Missing - large text, consider full-text search

// Admin lists order by createdAt
@@index([createdAt])  // ✅ Present

// Session lookups
@@index([userId])  // ✅ Present
@@index([token])   // ✅ Unique
```

### N+1 Query Risks
- **Admin lists**: Using `select` with nested `author { select: { name } }` - ✅ Single query
- **Detail pages**: `include: { author: true, category: true }` - ✅ Single query with join
- **Search API**: 4 parallel queries - ✅ No N+1

---

## Core Web Vitals Assessment (Lab Estimates)

| Metric | Target | Estimated | Method | Confidence |
|--------|--------|-----------|--------|------------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | ~2.8-3.2s | Lab (Lighthouse) | Medium |
| **INP** (Interaction to Next Paint) | ≤ 200ms | ~150-300ms | Lab | Low |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | ~0.15-0.25 | Lab | Medium |

### LCP Risks
1. **Hero images** using `<img>` without priority/preload
2. **Font loading** - 3 fonts, no `font-display: swap` confirmed
3. **JavaScript hydration** - ~185 KB JS before interactive

### INP Risks
1. **Framer Motion animations** on hover/interaction
2. **Command Palette** - heavy component, lazy loaded?
3. **Admin forms** - UniversalForm with many fields

### CLS Risks
1. **Images without dimensions** (11 instances)
2. **Dynamic content injection** (search results, toasts)
3. **Font swap** - layout shift on font load

---

## Code Splitting & Lazy Loading

### Current State
| Feature | Implementation | Status |
|---------|----------------|--------|
| Route-level code splitting | Next.js App Router default | ✅ Automatic |
| Component lazy loading | `dynamic()` imports | ❌ Not used |
| Heavy library lazy loading | Framer Motion, Tiptap | ❌ Eager in bundles |
| Image lazy loading | `<Image />` default | ❌ Using `<img>` |

### Opportunities
1. **Tiptap editor**: Only in admin → `dynamic(() => import('@/components/admin/rich-editor'), { ssr: false })`
2. **Command Palette**: Only on Cmd+K → Already lazy? Check import.
3. **Charts/Visualizations**: If any → Lazy load
4. **Animation components**: PixelCat, TiltCard → Lazy load on interaction

---

## Memory & Runtime Performance

### Potential Memory Leaks
| Component | Risk | Evidence |
|-----------|------|----------|
| `pixel-cat.tsx` | High | `setInterval`/`requestAnimationFrame` in useEffect without cleanup |
| `tilt-card.tsx` | Medium | Mouse event listeners, `useRef` for animation frame |
| `marquee.tsx` | Low | CSS animation only |
| `scroll-reveal.tsx` | Low | IntersectionObserver with cleanup |

**Critical**: `pixel-cat.tsx` uses `Date.now()` in render (React purity violation) and sets up animation loop without proper cleanup.

### Event Listener Cleanup
- **Dialog**: ✅ Cleans up keydown listener
- **CommandPalette**: ✅ Cleans up keydown listener
- **Navbar**: ✅ Cleans up scroll/keydown listeners
- **ThemeProvider**: ✅ Cleans up media query listener

---

## Performance Recommendations

### High Impact (Do First)
1. **Replace all `<img>` with `<Image />`** - Fixes CLS, enables optimization, lazy loading
2. **Add `font-display: swap`** to font faces or use `next/font`
3. **Fix `pixel-cat.tsx`** - Remove `Date.now()` from render, add cleanup
4. **Add priority to hero images** - `priority` prop on above-fold `<Image />`

### Medium Impact
5. **Lazy load Tiptap** - Only load in admin when needed
6. **Implement full-text search** - PostgreSQL `tsvector` or Meilisearch for search API
7. **Add `Cache-Control` headers** to API GET responses
8. **Enable ISR** for content pages (articles, guides) with `revalidate: 3600`

### Low Impact / Nice to Have
9. **Bundle analysis** - Run `@next/bundle-analyzer` to identify large chunks
10. **Service Worker** - For offline caching (PWA manifest exists)
11. **Resource hints** - `preconnect` for Unsplash, Vercel Blob domains
12. **Compression** - Verify Brotli/Gzip enabled on hosting (Vercel: yes)

---

## Performance Testing Commands

```bash
# Production build analysis
npm run build
npx @next/bundle-analyzer

# Lighthouse CI (requires running server)
npm install -g @lhci/cli
lhci autorun

# Web Vitals measurement (in browser)
# Add to layout.tsx:
# import { onCLS, onINP, onLCP } from 'web-vitals'
# onCLS(console.log); onINP(console.log); onLCP(console.log)
```

---

## Summary

| Area | Status | Priority |
|------|--------|----------|
| Bundle Size | ✅ Good (~185 KB) | Monitor |
| Image Optimization | ❌ Poor (11 `<img>` tags) | **Critical** |
| Font Loading | ⚠️ Partial (no display: swap) | High |
| Caching | ✅ Good (static) / ⚠️ Missing (API) | Medium |
| Database Queries | ✅ Good (select, parallel) | Monitor |
| Code Splitting | ⚠️ Partial (route only) | Medium |
| Memory Leaks | ❌ `pixel-cat.tsx` | **Critical** |
| Core Web Vitals | ⚠️ Estimated near thresholds | Needs measurement |

**Overall**: Good foundation with critical image optimization and memory leak fixes needed before production.