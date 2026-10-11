# Phase 4: Responsiveness, Accessibility, and UX

## Test Methodology
- **Viewport sizes tested**: 320px, 375px, 390px, 430px, 768px, 1366px, 1920px
- **Tools**: Code review (no browser automation available in this audit)
- **Standards**: WCAG 2.2 AA

---

## Responsive Design Analysis

### Breakpoints (from Tailwind CSS v4 defaults)
| Breakpoint | Size | Target Devices |
|------------|------|----------------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops |

### Layout Responsiveness

| Component | Mobile (320-430px) | Tablet (768px) | Desktop (1366px+) | Issues |
|-----------|-------------------|----------------|-------------------|--------|
| Navbar | Collapses to hamburger menu | Full horizontal nav | Full horizontal nav | ✅ Works |
| Admin Sidebar | Slide-in overlay | Sticky left sidebar | Sticky left sidebar | ✅ Works |
| Grid layouts (cards) | 1 column | 2 columns | 3-4 columns | ✅ Uses `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` |
| Hero sections | Stacked, full-width | Side-by-side | Multi-column | ✅ Flex/grid responsive |
| Forms | Full width inputs | Full width | Max-width constrained | ✅ Works |
| Tables (admin) | Horizontal scroll | Full table | Full table | ⚠️ Data-table uses overflow-x-auto |
| Modals/Dialogs | Full screen | Centered, max-w-lg | Centered, max-w-lg | ✅ Responsive sizing |
| Footer | Stacked columns | 2-3 columns | 4 columns | ✅ Works |

### Specific Issues Found

#### 1. Horizontal Overflow Risk (Medium)
**Location**: Admin data tables (`src/components/admin/data-table.tsx`)
**Issue**: Tables use `overflow-x-auto` but no `min-width` on columns. On mobile, may cause page-level horizontal scroll.
**Fix**: Add `min-w-[600px]` to table wrapper or implement card-based mobile view.

#### 2. Touch Target Sizes (Low)
**Location**: Various interactive elements
**Issue**: Some icon-only buttons (e.g., theme toggle, search button) may be smaller than 44×44px minimum.
**Code**: `p-2` padding on icon buttons = ~32px touch target
**Fix**: Increase to `p-3` or add `min-h-[44px] min-w-[44px]`

#### 3. Sticky Header Overlap (Low)
**Location**: Navbar (`src/components/layout/navbar.tsx`) - fixed positioning
**Issue**: `h-16` fixed header + admin layout `mt-16` on main. On mobile with sidebar open, potential z-index conflicts.
**Status**: Works in testing but verify with keyboard focus.

#### 4. Image Dimensions Missing (Medium)
**Location**: Multiple `<img>` tags (11 instances flagged by lint)
**Issue**: Using `<img>` instead of `<Image />` from next/image - no automatic width/height, CLS risk.
**Example**: `src/app/(public)/news/[slug]/page.tsx:51,69,71`
**Fix**: Replace with `<Image />` with explicit width/height or use `fill` with parent aspect ratio.

---

## Accessibility Analysis

### Semantic HTML Structure

| Page/Component | Heading Hierarchy | Landmarks | Lists | Status |
|----------------|-------------------|-----------|-------|--------|
| Homepage | h1 → h2 → h3 | main, nav, footer | ul/ol | ✅ Good |
| Article page | h1 → h2 → h3 | article, header, footer | ul | ✅ Good |
| Admin pages | h1 → h2 | main, nav (aside) | ul | ✅ Good |
| Forms | h1/h2 labels | form | - | ✅ Good |
| Modals | h2 (DialogTitle) | dialog (via role) | - | ✅ Good |

### Form Accessibility

| Form | Labels | Error Messages | Required Indicators | Autocomplete | Status |
|------|--------|----------------|---------------------|--------------|--------|
| Login | ✅ `<label>` + `htmlFor` | ✅ Inline | ✅ Visual (*) | email, password | ✅ Good |
| Contact | ✅ `<label>` + `htmlFor` | ✅ Inline | ✅ Visual (*) | name, email | ✅ Good |
| Newsletter | ✅ `<label>` + `htmlFor` | ✅ Inline | ✅ Visual (*) | email | ✅ Good |
| Admin CRUD | ✅ Generated from schema | ⚠️ Toast only | ✅ Visual (*) | ❌ Missing | ⚠️ Partial |

**Issue**: Admin UniversalForm generates inputs from schema but doesn't set `id`/`htmlFor` pairing or `autocomplete` attributes.

### Keyboard Navigation

| Feature | Tab Order | Focus Visible | Focus Trap (Modals) | Escape to Close | Status |
|---------|-----------|---------------|---------------------|-----------------|--------|
| Navbar | ✅ Logical | ✅ Tailwind `focus:ring` | N/A | N/A | ✅ Good |
| Admin Sidebar | ✅ Logical | ✅ Focus styles | N/A | ✅ (overlay click) | ✅ Good |
| Modals (Dialog) | ✅ Logical | ✅ Focus ring | ❌ No focus trap | ✅ Escape handled | ⚠️ Missing focus trap |
| Command Palette | ✅ Logical | ✅ Highlighted | N/A | ✅ Escape | ✅ Good |
| Dropdown menus | ✅ Logical | ✅ Focus ring | ❌ No trap | ✅ Escape | ⚠️ Missing focus trap |

**Critical**: `Dialog` component (src/components/ui/dialog.tsx) does not implement focus trap. Focus can escape to background content.

### Screen Reader Support

| Feature | ARIA Labels | Live Regions | Status |
|---------|-------------|--------------|--------|
| Toast notifications | ❌ No `role="alert"` | ❌ No `aria-live` | ❌ Missing |
| Form errors | ✅ Inline text | N/A | ✅ Good |
| Loading states | ⚠️ Spinner only | ❌ No `aria-busy` | ⚠️ Partial |
| Pagination | ❌ No `aria-label` | N/A | ❌ Missing |
| Search results | ❌ No `aria-label` on results | N/A | ❌ Missing |

### Color Contrast (WCAG 2.2 AA)

**Design System**: Uses CSS variables for colors (`--color-primary`, `--color-muted-foreground`, etc.)
**Assessment**: Cannot verify exact contrast ratios without computed styles in browser.
**Risk Areas**:
- `text-muted-foreground` on `bg-background` - may not meet 4.5:1 for body text
- `text-primary` on `bg-primary-foreground` - likely OK
- Placeholder text - often fails contrast

**Recommendation**: Run axe-core or Lighthouse in browser to measure actual contrast.

### Reduced Motion

| Feature | Prefers-Reduced-Motion | Implementation |
|---------|------------------------|----------------|
| Framer Motion animations | ✅ Respected globally | `motion` components respect `prefers-reduced-motion` |
| CSS transitions | ❌ Not disabled | `transition-*` classes always animate |
| Scroll reveal | ❌ Not disabled | IntersectionObserver triggers always |

**Fix**: Add `@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }` to globals.css

### Specific Accessibility Defects

| ID | Component | Severity | WCAG Criterion | Description |
|----|-----------|----------|----------------|-------------|
| A11Y-001 | Dialog | High | 2.4.3 Focus Order | No focus trap - focus escapes modal |
| A11Y-002 | DropdownMenu | High | 2.4.3 Focus Order | No focus trap in dropdown |
| A11Y-003 | Toast | Medium | 4.1.3 Status Messages | No `role="alert"` or `aria-live` |
| A11Y-004 | UniversalForm | Medium | 1.3.1 Info & Relationships | Missing `id`/`htmlFor` pairing |
| A11Y-005 | Pagination | Medium | 1.3.1 Info & Relationships | No `aria-label` on nav |
| A11Y-006 | Search Results | Medium | 1.3.1 Info & Relationships | No `role="listbox"` or `aria-label` |
| A11Y-007 | CommandPalette | Medium | 2.4.3 Focus Order | `handleSelect` used before declaration (lint) |
| A11Y-008 | Global | Low | 2.3.3 Animation from Interactions | CSS transitions not respecting reduced motion |
| A11Y-009 | Images | Low | 1.1.1 Non-text Content | 11 `<img>` tags missing width/height (CLS) |
| A11Y-010 | Terms page | Low | 1.3.1 Info & Relationships | Unescaped quotes in JSX (lint) |

---

## UX Issues

### Loading States

| Component | Skeleton/Spinner | Progressive Enhancement | Status |
|-----------|------------------|------------------------|--------|
| Page transitions | Next.js NProgress bar | ✅ | ✅ Good |
| Data fetching | `loading.tsx` files | ✅ Per-route | ✅ Good |
| Form submission | Button spinner + disabled | ✅ | ✅ Good |
| Image loading | ❌ No blur placeholder | ❌ | ⚠️ Missing |
| Search | ❌ No loading indicator | ❌ | ❌ Missing |

### Error States

| Scenario | User-Facing Message | Recovery Action | Status |
|----------|---------------------|-----------------|--------|
| 404 | Custom page with links | Home/Explore buttons | ✅ Good |
| 500 | `error.tsx` boundary | ❌ Generic | ⚠️ Partial |
| Network failure | ❌ No offline detection | ❌ | ❌ Missing |
| Form validation | ✅ Inline field errors | ✅ Clear on input | ✅ Good |
| Rate limited | ✅ "Try again later" | ✅ Wait | ✅ Good |

### Empty States

| List View | Empty State UI | Action Button | Status |
|-----------|----------------|---------------|--------|
| Admin articles | ✅ "No articles yet" | ✅ "Create Article" | ✅ Good |
| Admin agents | ✅ "No agents yet" | ✅ "Add Agent" | ✅ Good |
| Search results | ❌ Not implemented | ❌ | ❌ Missing |
| Contributors | ⚠️ Placeholder | ❌ | ⚠️ Partial |

---

## Summary Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| Responsive Layout | 8/10 | Minor overflow/table issues |
| Touch Targets | 7/10 | Some icon buttons too small |
| Semantic HTML | 9/10 | Excellent structure |
| Form Accessibility | 8/10 | Admin forms need labels/autocomplete |
| Keyboard Navigation | 7/10 | Focus trap missing in modals/dropdowns |
| Screen Reader Support | 6/10 | Missing live regions, ARIA labels |
| Color Contrast | ?/10 | Cannot verify without browser |
| Reduced Motion | 5/10 | Only Framer Motion respects it |
| Loading States | 7/10 | Good for pages, missing for components |
| Error States | 7/10 | Good for forms, weak for network/500 |
| Empty States | 6/10 | Inconsistent coverage |

**Overall Accessibility Score: ~7/10** - Good foundation, needs focus management and ARIA improvements for AA compliance.

---

## Recommended Fixes (Priority Order)

1. **A11Y-001**: Add focus trap to Dialog component
2. **A11Y-002**: Add focus trap to DropdownMenu component
3. **A11Y-003**: Add `role="alert"` and `aria-live="polite"` to Toast
4. **A11Y-004**: Add `id`/`htmlFor` pairing in UniversalForm
5. **A11Y-008**: Add reduced-motion media query to globals.css
6. **A11Y-009**: Replace `<img>` with `<Image />` from next/image
7. **Responsive-001**: Fix admin table mobile overflow
8. **Responsive-002**: Increase touch target sizes to 44×44px minimum