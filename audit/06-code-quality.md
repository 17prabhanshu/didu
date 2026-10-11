# Phase 6: Code Quality and Automated Testing

## Current Tooling Status

| Tool | Version | Status | Config |
|------|---------|--------|--------|
| TypeScript | 5.x | ✅ Passes | `tsconfig.json` (strict: true) |
| ESLint | 9.x | ❌ 131 errors, 87 warnings | `eslint.config.mjs` (Next.js config) |
| Vitest | 3.0.5 | ❌ 31/78 tests fail | `vitest.config.ts` |
| Playwright | 1.51.1 | ⚠️ Not executed | `playwright.config.ts` |
| Prisma | 6.19.3 | ✅ Generates | `schema.prisma` |
| Prettier | Not configured | ❌ Missing | - |

---

## TypeScript Analysis

### Configuration (`tsconfig.json`)
```json
{
  "strict": true,
  "noEmit": true,
  "isolatedModules": true,
  "jsx": "react-jsx",
  "moduleResolution": "bundler"
}
```
**Status**: ✅ Strict mode enabled, no emit (type-check only), good settings.

### Type Check Result
```
npm run typecheck
✓ No errors
```

### Type Safety Issues (from lint)
- **71 occurrences** of `@typescript-eslint/no-explicit-any`
- **Locations**: API routes, admin components, test files
- **Risk**: Runtime errors, lost type safety, refactoring hazards

**Example pattern**:
```typescript
// Bad (in src/app/api/admin/crud/route.ts)
const sanitizedData = await applyMaskingProtocol(model, data, session);
const result = await (db as any)[model].create({ data: sanitizedData });

// Better
const result = await db[model as keyof typeof db].create({ data: sanitizedData });
```

---

## ESLint Analysis

### Error Categories (131 errors)

| Rule | Count | Severity | Example Locations |
|------|-------|----------|-------------------|
| `@typescript-eslint/no-explicit-any` | 71 | Error | API routes, components, lib |
| `react-hooks/set-state-in-effect` | 12 | Error | dialog, select, command-palette, theme-provider, tilt-card, universal-form, pixel-cat |
| `react-hooks/exhaustive-deps` | 2 | Error | command-palette |
| `react-hooks/purity` | 1 | Error | pixel-cat.tsx:20 (Date.now()) |
| `@typescript-eslint/no-require-imports` | 6 | Error | test files, proxy.ts, session.ts |
| `react/no-unescaped-entities` | 6 | Error | terms/page.tsx, command-palette.tsx |
| `@next/next/no-img-element` | 11 | Warning | Multiple pages |
| `@typescript-eslint/no-unused-vars` | ~20 | Warning | Various |

### Critical React Hooks Violations

| File | Line | Issue | Fix |
|------|------|-------|-----|
| `src/components/ui/dialog.tsx` | 25 | `setOpen(openProp)` in useEffect | Use controlled/uncontrolled pattern properly |
| `src/components/ui/select.tsx` | 27 | `setInternalValue(value)` in useEffect | Same |
| `src/components/ui/command-palette.tsx` | 43, 49, 59 | `setQuery`, `setResults` in useEffect | Move to event handlers |
| `src/components/search/command-palette.tsx` | 43 | `setQuery('')` in useEffect | Same |
| `src/components/layout/theme-provider.tsx` | 35 | `setMounted(true)` in useEffect | Use `useSyncExternalStore` or init state from localStorage |
| `src/components/animations/tilt-card.tsx` | 22 | `setMounted(true)` in useEffect | Same |
| `src/components/admin/universal-form.tsx` | 101 | `setError` in useEffect | Move to callback |
| `src/components/animations/pixel-cat.tsx` | 20, 50 | `Date.now()` in render, `setPath` in useEffect | Use `useRef` for time, init in useEffect callback |

---

## Test Results Analysis

### Unit Tests (`npm run test`)
**Total**: 78 tests across 14 files
**Passed**: 47
**Failed**: 31

#### Failure Breakdown

| Test File | Tests | Failed | Root Cause |
|-----------|-------|--------|------------|
| `session.test.ts` | 9 | 9 | Mock setup incorrect, NEXT_REDIRECT not handled |
| `auth.test.ts` | 7 | 1 (compile) | `await` at top level in test |
| `validation.test.ts` | 25 | 1 | `searchSchema` min query length not enforced (min 1 vs min 2) |
| `login.route.test.ts` | 4 | 1 | Invalid password returns 200 instead of 401 |
| `crud.route.test.ts` | 6 | 1 | Forbidden thrown instead of 401 |
| `health.route.test.ts` | 2 | 2 | `db.$queryRaw` not mocked |
| `contact.route.test.ts` | 3 | 3 | FormData parsing fails in test env |
| `newsletter.route.test.ts` | 6 | 6 | FormData parsing fails in test env |
| `upload.route.test.ts` | 4 | 3 | FormData parsing fails in test env |
| `upload.magic-bytes.test.ts` | 5 | 5 | FormData parsing fails in test env |

#### Systemic Issues
1. **FormData in tests**: `undici` (Node's fetch) doesn't parse FormData without proper Content-Type
2. **Middleware redirects**: `NEXT_REDIRECT` error not caught by test assertions
3. **Mock setup**: `vi.mocked(cookies.cookies)` incorrect - should mock `cookies()` function
4. **Auth test compile error**: `const jwt = await import('jsonwebtoken')` at top level of test

---

## Code Quality Issues

### 1. Dead Code / Unused Imports
- **20+ instances** of unused imports/variables (lint warnings)
- **Examples**: `PenLine` in navbar, `Mail`/`Key`/`Smartphone` in settings, `motion` in button

### 2. Inconsistent Error Handling
- Some routes return `{ success: false, error: { message } }`
- Others return `{ error: "message" }`
- Others throw and let middleware handle
- **Standardize** on one pattern

### 3. Database Access Pattern
```typescript
// Inconsistent: sometimes (db as any)[model], sometimes db.model
// Better: Create typed repository functions
const articleRepo = {
  findAll: () => db.article.findMany({ select: {...} }),
  findBySlug: (slug: string) => db.article.findUnique({ where: { slug } }),
  // ...
}
```

### 4. Magic Strings for Roles
```typescript
// Scattered across codebase
'super_admin', 'EDITOR', 'AUTHOR', 'CONTRIBUTOR', 'REVIEWER'
// Should be: enum Role { SUPER_ADMIN, EDITOR, ... }
```

### 5. Inconsistent API Response Shapes
```typescript
// Some routes:
return NextResponse.json({ success: true, data: result })
// Others:
return NextResponse.json(result)
// Errors:
{ success: false, error: { message: "..." } }
vs
{ error: "..." }
vs
{ error: { message: "..." } }
```

### 6. Client-Side State Management
- **No global state** (Redux/Zustand) - good, uses React state
- **Server state**: Direct fetch in components - consider React Query/SWR
- **Theme**: Custom context - works but could use `next-themes`

---

## Architecture Patterns

### Good Patterns ✅
1. **Server Components by default** - Most pages are RSC
2. **Client Components only when needed** - `"use client"` directive used correctly
3. **Colocation** - Components near routes that use them
4. **Zod validation at boundaries** - All API routes validate input
5. **Middleware for auth** - `proxy.ts` protects admin routes
6. **Rate limiting abstraction** - Upstash Redis + in-memory fallback
7. **Prisma singleton** - `db.ts` prevents multiple clients in dev

### Patterns Needing Improvement ⚠️
1. **Generic CRUD API** - `(db as any)[model]` loses type safety
2. **Session validation duplication** - Middleware + `session.ts` both validate
3. **Error boundaries** - No `error.tsx` in most route groups
4. **Loading states** - `loading.tsx` exists but not all routes
5. **Form handling** - Mix of `react-hook-form` and manual state

---

## Missing Quality Gates

| Gate | Status | Recommendation |
|------|--------|----------------|
| Pre-commit hooks | ❌ Missing | Add `husky` + `lint-staged` |
| Commit message linting | ❌ Missing | Add `commitlint` |
| Dependency audit in CI | ✅ Configured | `npm audit --audit-level=high` |
| CodeQL analysis | ✅ Configured | Security-extended queries |
| Bundle size check | ❌ Missing | Add `@next/bundle-analyzer` |
| Visual regression | ❌ Missing | Consider Chromatic or Percy |
| Accessibility testing | ❌ Missing | Add `axe-core` to Playwright |

---

## Recommended Fixes (Priority Order)

### Critical (Block CI/CD)
1. **Fix 31 failing tests** - Mock FormData, handle NEXT_REDIRECT, fix auth test syntax
2. **Fix React hooks violations** - 12 instances of setState in useEffect
3. **Fix `pixel-cat.tsx` purity violation** - `Date.now()` in render

### High (Before Deploy)
4. **Eliminate `any` types** - 71 occurrences, replace with proper types
5. **Standardize API responses** - Consistent shape across all routes
6. **Add Prettier** - Format on save, consistent style

### Medium (Technical Debt)
7. **Create Role enum** - Replace magic strings
8. **Typed repository layer** - Replace `(db as any)[model]`
9. **Unified session validation** - Single source of truth
10. **Add error boundaries** - Per route group `error.tsx`

### Low (Polish)
11. **Remove unused imports** - 20+ warnings
12. **Add pre-commit hooks** - Husky + lint-staged
13. **Bundle size monitoring** - CI check for budget

---

## Test Infrastructure Fixes Needed

### For FormData Testing
```typescript
// vitest.setup.ts - add FormData polyfill
import { FormData } from 'formdata-node';
global.FormData = FormData as any;

// Or use msw (Mock Service Worker) for API testing
```

### For NEXT_REDIRECT Handling
```typescript
// Test utils
import { getRedirectError } from 'next/dist/client/components/redirect';

try {
  await requireAuth();
} catch (e) {
  if (getRedirectError(e)) {
    // Expected redirect
  }
}
```

### For Middleware Testing
- Use `next-test-utils` or test against running server with Playwright
- Unit testing middleware is difficult - prefer integration tests

---

## Summary

| Metric | Current | Target |
|--------|---------|--------|
| TypeScript Errors | 0 | 0 ✅ |
| ESLint Errors | 131 | 0 |
| Unit Tests Passing | 60% (47/78) | 100% |
| E2E Tests Passing | Unknown | 100% |
| Code Coverage | Not measured | >80% critical paths |
| Duplicate Code | Not measured | <5% |
| Cyclomatic Complexity | Not measured | <10 per function |

**Verdict**: Code quality needs significant work before production. ESLint errors and failing tests must be resolved. Architecture is solid but has type safety gaps and inconsistent patterns.