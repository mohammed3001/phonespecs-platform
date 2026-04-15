# MobilePlatform — Execution Blueprint

### From Strategy to Build Program

**Version**: 1.0  
**Classification**: CTO-Grade Execution Plan  
**Scope**: Concrete deliverables, dependencies, priorities, risks, and implementation sequence

---

## Table of Contents

1. [Current State Audit](#1-current-state-audit)
2. [Architecture Decisions Required Before Building](#2-architecture-decisions-required-before-building)
3. [Execution Phase 1: Foundation Hardening](#3-execution-phase-1-foundation-hardening)
4. [Execution Phase 2: Search & Discovery Infrastructure](#4-execution-phase-2-search--discovery-infrastructure)
5. [Execution Phase 3: SEO & Structured Content Infrastructure](#5-execution-phase-3-seo--structured-content-infrastructure)
6. [Execution Phase 4: Trust & Data Integrity Systems](#6-execution-phase-4-trust--data-integrity-systems)
7. [Execution Phase 5: Revenue-Readiness Architecture](#7-execution-phase-5-revenue-readiness-architecture)
8. [Execution Phase 6: First Strategic Moat Layer](#8-execution-phase-6-first-strategic-moat-layer)
9. [Cross-Cutting Concerns](#9-cross-cutting-concerns)
10. [Dependency Graph](#10-dependency-graph)
11. [Risk Register](#11-risk-register)
12. [Milestone Schedule](#12-milestone-schedule)

---

## 1. Current State Audit

Before building, here is the honest gap analysis of what exists vs. what is needed.

### What Is Built and Working

| System | Status | Quality | Notes |
|--------|--------|---------|-------|
| **Prisma Schema** | ✓ Complete | High | 811 lines, ~50 tables. Covers phones, specs, articles, reviews, discussions, ads, CMS, SEO, menus, payments, audit. Structurally sound. |
| **Homepage** | ✓ Built | Medium | Hero, stats, featured phones, brand grid, CTA. Functional but SSR data fetching is correct. |
| **Phone Listing** | ✓ Built | Medium | Client-side filtering via API, pagination, brand/price/status filters. Needs facet counts and spec-based filters. |
| **Phone Detail** | ✓ Built | Medium | Grouped specs with Iconify icons, related phones, FAQ section. Needs gallery, reviews UI, structured data. |
| **Compare Page** | ✓ Built | Medium | Search + add up to 4 phones, grouped comparison table. Bug fixed (commit fb9234c). |
| **Brands Page** | ✓ Built | Medium | Brand cards with phone counts. Needs individual brand detail pages. |
| **News Page** | ✓ Built | Low | Featured article + grid. Static seed data. No real CMS flow. |
| **Admin Panel** | ✓ Built | Medium | 15 pages: Dashboard, Phones, Brands, Articles, Specs, Campaigns, Ad Slots, SEO, Media, Users, Roles, Settings, Audit Log. Iconify sidebar. |
| **Admin: Add Phone** | ✓ Built | Medium | Basic info + dynamic spec fields loaded from DB. Needs image upload, variants, validation. |
| **Auth System** | ✓ Built | Low | NextAuth with credentials. Admin login works. No user registration. No middleware protection. |
| **API Layer** | ✓ Built | Medium | 15 endpoints. RESTful. Phones, brands, specs, admin CRUD. No input validation (Zod). No rate limiting. |
| **Shared Components** | ✓ Built | Medium | Header (with search overlay), Footer, PhoneCard (3 variants), SpecIcon/GroupIcon/NavIcon. |
| **Seed Data** | ✓ Built | High | 6 phones, 8 brands, 24 spec definitions across 7 groups. Realistic data. |
| **Dynamic Spec System** | ✓ Built | High | SpecGroup → SpecDefinition → PhoneSpec chain. Admin-editable. Visibility flags per context. Core differentiator working. |

### What Is Missing (Critical Gaps)

| System | Gap | Impact | Needed By |
|--------|-----|--------|-----------|
| **JSON-LD Structured Data** | Not implemented anywhere | SEO: No rich snippets, no Google product cards | Phase 3 |
| **sitemap.xml** | No file, no generation logic | SEO: Google can't discover pages efficiently | Phase 3 |
| **robots.txt** | No file | SEO: No crawl directives | Phase 3 |
| **next.config.mjs** | Empty — no image domains, no headers, no redirects | Performance, security, image optimization | Phase 1 |
| **Middleware** | None — no auth protection, no rate limiting, no redirects | Security: admin panel is unprotected at route level | Phase 1 |
| **Meilisearch** | Not integrated — search uses Prisma `contains` (no typo tolerance, no facets, no relevancy) | Search is unusable for production | Phase 2 |
| **Image Optimization** | No Sharp pipeline, no responsive images, no WebP/AVIF | Performance: Large images, no format negotiation | Phase 1 |
| **User Registration** | No signup flow, no email verification, no public accounts | No community features possible (reviews, discussions) | Phase 4 |
| **Input Validation** | No Zod schemas on API routes | Security: Unvalidated inputs in all mutations | Phase 1 |
| **Error Boundaries** | No error.tsx or not-found.tsx pages | UX: Crashes show raw error or blank page | Phase 1 |
| **Loading States** | No loading.tsx skeleton pages | UX: Pages show nothing while loading | Phase 1 |
| **Brand Detail Pages** | `/brands/[slug]` doesn't exist — brands page is list-only | SEO: Missing high-value brand landing pages | Phase 1 |
| **Canonical URLs** | No canonical tags on any page | SEO: Potential duplicate content issues | Phase 3 |
| **Open Graph Images** | No OG images generated | Social: Poor sharing experience | Phase 3 |
| **Ad Serving Engine** | Schema exists, no serving logic | Revenue: Ads architecture is placeholder | Phase 5 |
| **Company Portal** | Landing page only — no actual portal functionality | Revenue: Brands can't self-serve | Phase 5 |
| **Price Tracking** | Single `priceUsd` field — no history, no multi-retailer | User value: No price intelligence | Phase 6+ |

### Code Quality Assessment

| Dimension | Current State | Target |
|-----------|--------------|--------|
| **TypeScript Strictness** | Loose — uses `Record<string, unknown>`, some `any` casts | Strict mode, Zod-validated inputs |
| **Component Architecture** | Flat — pages contain all logic and rendering | Extract data fetching, shared layouts, UI primitives |
| **Error Handling** | Try/catch with console.error only | Structured error types, user-facing error pages, monitoring |
| **Testing** | Manual browser testing only | E2E smoke tests minimum, unit tests for services |
| **Accessibility** | Not audited | WCAG 2.1 AA target (aria labels, keyboard nav, contrast) |
| **Bundle Size** | Unknown — no analysis done | < 150KB initial JS |

---

## 2. Architecture Decisions Required Before Building

These decisions must be made **before** writing code. They affect everything downstream.

### Decision 1: Database — SQLite → PostgreSQL Migration Timing

**Current**: SQLite (`prisma/dev.db`, 628KB)  
**Target**: PostgreSQL for production

**Decision**: **Migrate now, at start of Phase 1.**

**Rationale**:
- SQLite lacks full-text search, JSON operators, and concurrent write support
- Prisma migrations behave differently between SQLite and PostgreSQL (e.g., enum support, default expressions)
- Building on SQLite and migrating later creates schema drift risk
- Phase 2 (Meilisearch) and Phase 3 (programmatic SEO) need PostgreSQL's query capabilities

**Implementation**:
1. Change `schema.prisma` datasource provider to `postgresql`
2. Set up local PostgreSQL (Docker) for development
3. Set up production PostgreSQL (Supabase free tier or Vercel Postgres)
4. Re-run `prisma db push` + seed
5. Verify all queries work (SQLite `contains` → PostgreSQL `contains` is compatible via Prisma)

**Complexity**: Low (2-3 hours)  
**Risk**: Low — Prisma abstracts the differences. Only custom SQL (none exists) would break.

### Decision 2: Image Storage Strategy

**Current**: No image upload. `mainImage` field stores placeholder URLs.  
**Target**: Real image upload, optimization, and CDN delivery.

**Decision**: **Use Vercel Blob (S3-compatible) + Sharp optimization on upload.**

**Rationale**:
- Vercel Blob is zero-config with Next.js deployment
- Sharp runs at upload time (API route), not at serve time
- Generates WebP + original format at standard breakpoints (320, 640, 960, 1280)
- CDN delivery is automatic via Vercel's edge network
- Migration to S3 + CloudFront is straightforward later if needed

**Implementation**:
1. Add `@vercel/blob` dependency
2. Create `/api/media/upload` route with Sharp pipeline
3. Store variant URLs in `Media` table's `variants` JSON field
4. Update `PhoneImage`, `Brand.logo`, `Article.featuredImage` to reference Media records
5. Create `<OptimizedImage>` component with responsive `srcset`

**Complexity**: Medium (1-2 days)  
**Risk**: Medium — Sharp + serverless can hit memory limits on very large images. Mitigate with upload size cap (10MB).

### Decision 3: Search Engine Selection

**Current**: Prisma `name.contains(query)` — no typo tolerance, no ranking, no facets.  
**Target**: Production-grade search.

**Decision**: **Meilisearch (self-hosted or Meilisearch Cloud).**

**Rationale**: Already decided in strategy doc. Confirmed as correct choice:
- Sub-50ms response with typo tolerance
- Built-in faceted search (brand, price range, specs)
- Self-hosted: $0 cost, no per-query pricing
- Meilisearch Cloud: Free tier sufficient for <10K documents, ~$30/month for growth
- Simpler operations than Elasticsearch, better search UX than Algolia at this scale

**Implementation path**: Detailed in Phase 2 below.

**Complexity**: High (3-5 days for full integration)  
**Risk**: Medium — New infrastructure dependency. Mitigate with fallback to Prisma full-text search if Meilisearch is unavailable.

### Decision 4: Deployment Target

**Current**: Local development only. Vercel CI fails (Root Directory misconfiguration).  
**Target**: Production deployment.

**Decision**: **Vercel for application + Supabase for PostgreSQL + Meilisearch Cloud (or Railway) for search.**

**Rationale**:
- Vercel: Zero-config Next.js deployment, automatic edge caching, ISR support, Blob storage
- Supabase: Free tier PostgreSQL with connection pooling, auth as backup, automatic backups
- Meilisearch Cloud: Managed instance, free tier for development

**Immediate action**: Fix Vercel project settings (Root Directory → `/`) to unblock CI.

**Complexity**: Low-Medium (1 day)  
**Risk**: Low — All managed services, minimal ops burden.

---

## 3. Execution Phase 1: Foundation Hardening

**Goal**: Make the existing platform production-grade — performant, secure, responsive, and architecturally sound.

**Duration**: 5-7 days  
**Prerequisites**: Architecture decisions 1-4 resolved  
**Exit Criteria**: Platform deployable to production, passes Lighthouse performance audit (>90), all public pages responsive and error-free.

### 1.1 Database Migration to PostgreSQL

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| Switch Prisma provider to `postgresql` | Change `schema.prisma` datasource, update `.env` | Low | P0 |
| Docker Compose for local PostgreSQL | `docker-compose.yml` with PostgreSQL 16 + Redis | Low | P0 |
| Re-seed database | Run `prisma db push` + `seed.ts` on PostgreSQL | Low | P0 |
| Verify all queries | Run through all pages, confirm data loads | Low | P0 |

**Technical Detail**:
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: mobileplatform
      POSTGRES_USER: mp_dev
      POSTGRES_PASSWORD: mp_dev_password
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
volumes:
  pgdata:
```

### 1.2 Next.js Configuration Hardening

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| `next.config.mjs` — image domains | Allow external image domains (placeholder services, CDN) | Low | P0 |
| `next.config.mjs` — security headers | X-Frame-Options, CSP, HSTS, X-Content-Type-Options | Low | P0 |
| `next.config.mjs` — redirects | `/admin` without auth → `/login` | Low | P1 |
| `next.config.mjs` — compression | Enable gzip/brotli | Low | P0 |

**Technical Detail**:
```js
// next.config.mjs
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
};
```

### 1.3 Middleware — Auth Protection & Route Guards

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| `src/middleware.ts` | Protect `/admin/*` and `/company/*` routes | Medium | P0 |
| Auth redirect logic | Unauthenticated → `/login?redirect=...` | Low | P0 |
| Role-based access | Admin routes require admin role, company routes require company role | Medium | P1 |

**Technical Detail**:
```typescript
// src/middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;
      if (path.startsWith("/admin")) return token?.role === "admin";
      if (path.startsWith("/company")) return !!token?.companyId;
      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*", "/company/:path*"],
};
```

### 1.4 Error Handling & Loading States

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| `src/app/not-found.tsx` | Global 404 page with navigation back | Low | P0 |
| `src/app/error.tsx` | Global error boundary with retry | Low | P0 |
| `src/app/phones/loading.tsx` | Skeleton loading for phone listing | Low | P1 |
| `src/app/phones/[slug]/loading.tsx` | Skeleton loading for phone detail | Low | P1 |
| `src/app/admin/loading.tsx` | Admin loading spinner | Low | P2 |
| `src/app/brands/[slug]/page.tsx` | Brand detail page (NEW — critical gap) | Medium | P0 |
| `src/app/brands/[slug]/loading.tsx` | Brand detail loading skeleton | Low | P1 |

### 1.5 API Validation & Security

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| Install Zod | `npm install zod` | Low | P0 |
| Create validation schemas | `src/lib/validations/` — phone, brand, article, campaign schemas | Medium | P0 |
| Apply to all mutation endpoints | Validate request body in POST/PUT/PATCH handlers | Medium | P0 |
| Sanitize query params | Validate and clamp pagination, prevent SQL-like injection via Prisma | Low | P1 |
| Rate limiting (basic) | In-memory rate limiter for API routes (upgrade to Redis later) | Medium | P1 |

**Technical Detail — Validation Example**:
```typescript
// src/lib/validations/phone.ts
import { z } from "zod";

export const createPhoneSchema = z.object({
  name: z.string().min(1).max(255),
  brandId: z.string().uuid(),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  marketStatus: z.enum(["available", "coming_soon", "discontinued"]).default("available"),
  priceUsd: z.number().positive().optional(),
  overview: z.string().max(5000).optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  specs: z.array(z.object({
    specId: z.string().uuid(),
    value: z.string(),
    numericValue: z.number().optional(),
  })).optional(),
});
```

### 1.6 Responsive Design & UI Polish

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| Mobile audit — all 6 public pages | Test at 375px, 768px, 1024px, 1440px breakpoints | Medium | P0 |
| Fix Header mobile menu | Verify hamburger menu works, search overlay is touch-friendly | Low | P0 |
| PhoneCard responsive variants | Ensure cards work in 1-col (mobile), 2-col (tablet), 3-4 col (desktop) | Low | P0 |
| Phone detail — mobile layout | Stack spec tables, make tabs scrollable | Medium | P0 |
| Compare page — mobile scroll | Horizontal scroll for comparison table on small screens | Medium | P1 |
| Typography scale | Consistent heading sizes, line heights, spacing across all pages | Low | P1 |
| Touch targets | All clickable elements ≥ 44x44px on mobile | Low | P1 |

### 1.7 Performance Baseline

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| Lighthouse audit — establish baseline | Run on all public pages, record scores | Low | P0 |
| Image lazy loading | `loading="lazy"` on all below-fold images | Low | P0 |
| Font optimization | `next/font` already used (Inter). Verify `display: swap`. | Low | P0 |
| Bundle analysis | `@next/bundle-analyzer` — identify large dependencies | Low | P1 |
| Iconify optimization | Verify icons load on-demand, not bundled | Low | P1 |

### Phase 1 — Dependency Chain

```
1.1 PostgreSQL Migration ──→ All subsequent work
     │
     ├──→ 1.2 Next.js Config (parallel with 1.3)
     ├──→ 1.3 Middleware Auth (parallel with 1.2)
     ├──→ 1.4 Error/Loading States (parallel)
     ├──→ 1.5 API Validation (after 1.1, parallel with 1.4)
     │
     └──→ 1.6 Responsive Polish ──→ 1.7 Performance Baseline
```

### Phase 1 — Exit Checklist

- [ ] PostgreSQL running locally, all data seeded
- [ ] `npx next build` succeeds with zero errors
- [ ] Lighthouse Performance > 90 on homepage
- [ ] All 6 public pages render correctly at 375px, 768px, 1440px
- [ ] `/admin/*` routes redirect to login when unauthenticated
- [ ] 404 page renders for invalid routes
- [ ] Error boundary catches and displays runtime errors
- [ ] All API mutation endpoints validate input with Zod
- [ ] Brand detail page (`/brands/[slug]`) exists and renders
- [ ] Loading skeletons appear during page transitions

---

## 4. Execution Phase 2: Search & Discovery Infrastructure

**Goal**: Replace the placeholder search with a production-grade search engine that supports autocomplete, typo tolerance, faceted filtering, and relevancy ranking.

**Duration**: 5-7 days  
**Prerequisites**: Phase 1 complete (PostgreSQL running, APIs validated)  
**Exit Criteria**: Users can search phones with typo tolerance, see instant autocomplete, filter by brand/price/specs, and get relevancy-ranked results.

### 2.1 Meilisearch Setup & Integration

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| Add Meilisearch to Docker Compose | `meilisearch:latest` with API key | Low | P0 |
| Install `meilisearch` JS client | `npm install meilisearch` | Low | P0 |
| Create `src/lib/search.ts` | Meilisearch client singleton, index config | Medium | P0 |
| Define phone search index | Searchable, filterable, sortable, displayed attributes | Medium | P0 |
| Build indexing service | Sync phones from PostgreSQL → Meilisearch on create/update/delete | High | P0 |
| Seed search index | Script to bulk-index all existing phones | Low | P0 |

**Technical Detail — Index Configuration**:
```typescript
// src/lib/search.ts
import { MeiliSearch } from "meilisearch";

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_URL || "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_KEY || "masterKey",
});

export const phonesIndex = client.index("phones");

// Index settings — run once during setup
export async function configureSearchIndexes() {
  await phonesIndex.updateSettings({
    searchableAttributes: ["name", "brandName", "overview", "specsText"],
    filterableAttributes: [
      "brandSlug", "marketStatus", "priceUsd", "releaseYear",
      "isPublished", "specRam", "specStorage", "specBattery",
      "specDisplaySize", "specMainCamera",
    ],
    sortableAttributes: [
      "name", "priceUsd", "releaseDate", "reviewScore", "viewCount", "createdAt",
    ],
    displayedAttributes: [
      "id", "name", "slug", "brandName", "brandSlug",
      "mainImage", "priceUsd", "priceDisplay",
      "marketStatus", "releaseDate", "reviewScore",
      "keySpecs", "updatedAt",
    ],
    rankingRules: [
      "words", "typo", "proximity", "attribute", "sort", "exactness",
    ],
    typoTolerance: {
      minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
    },
  });
}
```

### 2.2 Search Sync Pipeline

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| Create `src/lib/services/searchSync.ts` | Transform Prisma Phone → Meilisearch document | Medium | P0 |
| Hook into phone CRUD | After phone create/update/delete, queue search index update | Medium | P0 |
| BullMQ job for async indexing | `search-index-phone` job type | Medium | P1 |
| Full re-index API endpoint | `POST /api/admin/search/reindex` — rebuilds entire index | Medium | P1 |
| Index health check | `GET /api/admin/search/status` — document count, last indexed | Low | P2 |

**Technical Detail — Document Transformation**:
```typescript
// Transform a Prisma phone record into a Meilisearch document
export function phoneToSearchDocument(phone: PhoneWithBrandAndSpecs) {
  const specs = phone.specs.reduce((acc, ps) => {
    acc[ps.spec.key] = ps.value;
    if (ps.numericValue) acc[`spec_${ps.spec.key}_num`] = ps.numericValue;
    return acc;
  }, {} as Record<string, unknown>);

  return {
    id: phone.id,
    name: phone.name,
    slug: phone.slug,
    brandName: phone.brand.name,
    brandSlug: phone.brand.slug,
    mainImage: phone.mainImage,
    priceUsd: phone.priceUsd,
    priceDisplay: phone.priceDisplay,
    marketStatus: phone.marketStatus,
    releaseDate: phone.releaseDate,
    releaseYear: phone.releaseDate ? parseInt(phone.releaseDate.substring(0, 4)) : null,
    reviewScore: phone.reviewScore,
    viewCount: phone.viewCount,
    overview: phone.overview,
    isPublished: phone.isPublished,
    // Flattened specs for filtering
    specRam: specs.ram || null,
    specStorage: specs.storage || null,
    specBattery: specs.battery ? parseFloat(specs.battery as string) : null,
    specDisplaySize: specs.display_size ? parseFloat(specs.display_size as string) : null,
    specMainCamera: specs.main_camera ? parseFloat(specs.main_camera as string) : null,
    // Aggregated text for search
    specsText: phone.specs.map(ps => `${ps.spec.name} ${ps.value}`).join(" "),
    // Key specs for display in search results
    keySpecs: phone.specs
      .filter(ps => ps.spec.showInCard)
      .map(ps => ({
        key: ps.spec.key,
        name: ps.spec.name,
        value: ps.value,
        icon: ps.spec.icon,
        unit: ps.spec.unit,
        group: ps.spec.group.slug,
      })),
    updatedAt: phone.updatedAt.toISOString(),
    createdAt: phone.createdAt.toISOString(),
  };
}
```

### 2.3 Search UI — Autocomplete

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| Refactor Header search to use Meilisearch | Replace Prisma API call with Meilisearch query | Medium | P0 |
| Debounced autocomplete (200ms) | Instant suggestions as user types | Low | P0 |
| Suggestion rendering | Top 5 phone matches with image, name, price | Medium | P0 |
| Recent searches | Store in localStorage, show when search is focused | Low | P1 |
| Keyboard navigation | Arrow keys to navigate suggestions, Enter to select | Medium | P1 |
| "See all results" link | Press Enter or click to go to full search results page | Low | P0 |

### 2.4 Search Results Page

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| Create `/search/page.tsx` | Full search results page with URL query params | High | P0 |
| Faceted sidebar filters | Brand (multi-select with counts), Price range (slider), Market status, Battery range, RAM options, Camera MP range | High | P0 |
| Sort options | Relevance, Price ↑, Price ↓, Newest, Rating, Popularity | Medium | P0 |
| Result count + active filters display | "42 phones found" + removable filter chips | Medium | P0 |
| Pagination | Page-based with "Showing 1-12 of 42" | Medium | P0 |
| Empty state | Helpful message when no results match filters | Low | P1 |
| URL state sync | Filters/sort/page reflected in URL for shareability and SEO | Medium | P0 |

**Technical Detail — Search API Route**:
```typescript
// GET /api/search?q=samsung&brand=samsung&minPrice=500&maxPrice=1500&sort=price_asc&page=1
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const brands = searchParams.getAll("brand");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 12;

  const filters: string[] = ["isPublished = true"];
  if (brands.length) filters.push(`brandSlug IN [${brands.map(b => `"${b}"`).join(",")}]`);
  if (minPrice) filters.push(`priceUsd >= ${minPrice}`);
  if (maxPrice) filters.push(`priceUsd <= ${maxPrice}`);

  const sortRules: string[] = [];
  if (sort === "price_asc") sortRules.push("priceUsd:asc");
  else if (sort === "price_desc") sortRules.push("priceUsd:desc");
  else if (sort === "newest") sortRules.push("createdAt:desc");
  else if (sort === "rating") sortRules.push("reviewScore:desc");

  const results = await phonesIndex.search(q, {
    filter: filters.join(" AND "),
    sort: sortRules.length ? sortRules : undefined,
    limit,
    offset: (page - 1) * limit,
    facets: ["brandSlug", "marketStatus", "specRam", "specStorage"],
  });

  return NextResponse.json({
    hits: results.hits,
    total: results.estimatedTotalHits,
    facets: results.facetDistribution,
    processingTimeMs: results.processingTimeMs,
    page,
    limit,
  });
}
```

### 2.5 Search Analytics Foundation

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| Create `SearchQuery` table | Store query, results count, clicked result, timestamp | Medium | P1 |
| Log search queries | Record every search (async, non-blocking) | Low | P1 |
| Admin: Top searches dashboard | Show top 20 queries, zero-result queries | Medium | P2 |

### Phase 2 — Dependency Chain

```
2.1 Meilisearch Setup ──→ 2.2 Sync Pipeline ──→ 2.3 Autocomplete
                                    │              ──→ 2.4 Search Page
                                    │
                                    └──→ 2.5 Analytics (parallel, lower priority)
```

### Phase 2 — Exit Checklist

- [ ] Meilisearch running in Docker Compose alongside PostgreSQL
- [ ] All 6 phones indexed and searchable
- [ ] Typing "samsng" returns Samsung phones (typo tolerance works)
- [ ] Header autocomplete shows suggestions in < 200ms
- [ ] `/search?q=samsung` page renders with faceted filters
- [ ] Filters update results without full page reload
- [ ] URL reflects search state (bookmarkable, shareable)
- [ ] Sort by price, date, and relevance works correctly
- [ ] Facet counts update dynamically as filters are applied

---

## 5. Execution Phase 3: SEO & Structured Content Infrastructure

**Goal**: Make every page discoverable, indexable, and rich-snippet-ready. Build the foundation for programmatic SEO that can scale to thousands of pages.

**Duration**: 5-7 days  
**Prerequisites**: Phase 1 (PostgreSQL, validated pages), Phase 2 (search for internal linking)  
**Exit Criteria**: Google Search Console shows structured data detected, sitemap submitted, all pages have unique meta tags, JSON-LD renders on phone/brand/article pages.

### 3.1 Structured Data (JSON-LD)

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| Phone detail JSON-LD | `Product` schema with `name`, `brand`, `image`, `offers`, `aggregateRating`, `review` | High | P0 |
| Brand page JSON-LD | `Organization` schema with `name`, `logo`, `url` | Medium | P0 |
| Article JSON-LD | `Article` / `NewsArticle` schema with `headline`, `author`, `datePublished`, `image` | Medium | P0 |
| Breadcrumb JSON-LD | `BreadcrumbList` on all pages | Medium | P0 |
| Search Action JSON-LD | `WebSite` + `SearchAction` schema on homepage | Low | P1 |
| FAQ JSON-LD | `FAQPage` on phone detail pages that have FAQs | Medium | P1 |
| Create `src/lib/seo/jsonld.ts` | Helper functions to generate each schema type | Medium | P0 |

**Technical Detail — Phone JSON-LD**:
```typescript
// src/lib/seo/jsonld.ts
export function phoneJsonLd(phone: PhoneWithBrandAndSpecs) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: phone.name,
    description: phone.overview || `${phone.name} specifications and review`,
    image: phone.mainImage,
    brand: {
      "@type": "Brand",
      name: phone.brand.name,
    },
    offers: phone.priceUsd ? {
      "@type": "Offer",
      price: phone.priceUsd,
      priceCurrency: "USD",
      availability: phone.marketStatus === "available"
        ? "https://schema.org/InStock"
        : phone.marketStatus === "coming_soon"
          ? "https://schema.org/PreOrder"
          : "https://schema.org/Discontinued",
    } : undefined,
    aggregateRating: phone.reviewCount > 0 ? {
      "@type": "AggregateRating",
      ratingValue: phone.reviewScore,
      reviewCount: phone.reviewCount,
      bestRating: 10,
      worstRating: 1,
    } : undefined,
  };
}
```

### 3.2 Meta Tags System

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| Refine `generateMetadata` on all pages | Unique, keyword-rich title + description per page | Medium | P0 |
| Open Graph meta tags | `og:title`, `og:description`, `og:image`, `og:type`, `og:url` | Medium | P0 |
| Twitter Card meta tags | `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` | Low | P0 |
| Canonical URLs | `<link rel="canonical">` on every page | Medium | P0 |
| SEO template system | Admin-editable templates: `{phone.name} Specifications & Price | MobilePlatform` | Medium | P1 |

**Technical Detail — Enhanced generateMetadata**:
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const phone = await getPhone(params.slug);
  if (!phone) return { title: "Phone Not Found" };

  const title = `${phone.name} Specifications, Price & Review - MobilePlatform`;
  const description = phone.overview
    || `${phone.name} by ${phone.brand.name}. Full specs: ${phone.specs.slice(0,3).map(s => `${s.spec.name}: ${s.value}`).join(", ")}. Price: $${phone.priceUsd}.`;
  const url = `https://mobileplatform.com/phones/${phone.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: phone.mainImage ? [{ url: phone.mainImage, width: 800, height: 600, alt: phone.name }] : [],
      siteName: "MobilePlatform",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: phone.mainImage ? [phone.mainImage] : [],
    },
  };
}
```

### 3.3 Sitemap & Robots

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| `src/app/sitemap.ts` | Dynamic sitemap generation from database | Medium | P0 |
| `src/app/robots.ts` | Programmatic robots.txt | Low | P0 |
| Sitemap index | Split by entity type (phones, brands, articles, comparisons) | Medium | P1 |
| `lastmod` support | Use `updatedAt` for change frequency hints | Low | P1 |

**Technical Detail**:
```typescript
// src/app/sitemap.ts
import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mobileplatform.com";

  const phones = await prisma.phone.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });

  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/phones`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/brands`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/compare`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/news`, changeFrequency: "daily", priority: 0.8 },
    ...phones.map(phone => ({
      url: `${baseUrl}/phones/${phone.slug}`,
      lastModified: phone.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...brands.map(brand => ({
      url: `${baseUrl}/brands/${brand.slug}`,
      lastModified: brand.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
```

### 3.4 Programmatic SEO Pages

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| `/phones/best-camera` | Phones sorted by camera MP — auto-generated | Medium | P1 |
| `/phones/best-battery` | Phones sorted by battery capacity | Medium | P1 |
| `/phones/under-[price]` | Phones under $300, $500, $1000 — dynamic routes | Medium | P1 |
| `/phones/[brand]-phones` | All Samsung phones, all Apple phones — brand filtered | Medium | P1 |
| `/compare/[slug1]-vs-[slug2]` | Permanent comparison pages with unique URLs | High | P1 |
| Programmatic meta tags | Unique title/description for each generated page | Medium | P1 |
| Internal linking | Auto-suggest related programmatic pages from phone detail pages | Medium | P2 |

### 3.5 Breadcrumbs

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| `<Breadcrumbs>` component | Renders `Home > Phones > Samsung > Galaxy S24 Ultra` | Medium | P0 |
| JSON-LD for breadcrumbs | Structured data alongside visual breadcrumbs | Low | P0 |
| Integration on all public pages | Add breadcrumbs to phone detail, brand detail, article, compare | Low | P0 |

### Phase 3 — Dependency Chain

```
3.1 JSON-LD (parallel with 3.2)
3.2 Meta Tags (parallel with 3.1)
     │
     └──→ 3.3 Sitemap & Robots (needs pages to have canonical URLs)
          │
          └──→ 3.4 Programmatic SEO Pages (needs sitemap infrastructure)
               │
               └──→ 3.5 Breadcrumbs (parallel with 3.4)
```

### Phase 3 — Exit Checklist

- [ ] Phone detail pages include `Product` JSON-LD (validated via Google Rich Results Test)
- [ ] All pages have unique `<title>`, `<meta description>`, OG tags, Twitter cards
- [ ] `<link rel="canonical">` present on every page
- [ ] `/sitemap.xml` returns all published phones, brands, and static pages
- [ ] `/robots.txt` allows crawling with sitemap reference
- [ ] Breadcrumbs render on all interior pages with correct hierarchy
- [ ] At least 3 programmatic SEO page types exist (`/phones/best-camera`, `/phones/under-500`, etc.)
- [ ] Permanent comparison URLs exist (`/compare/samsung-galaxy-s24-ultra-vs-iphone-15-pro-max`)

---

## 6. Execution Phase 4: Trust & Data Integrity Systems

**Goal**: Engineer trust into the platform's data layer — provenance tracking, editorial transparency, audit capability, and the foundation for community verification.

**Duration**: 4-5 days  
**Prerequisites**: Phase 1 (PostgreSQL, auth middleware)  
**Exit Criteria**: Every phone spec change is auditable, data provenance is tracked, user registration works, review submission pipeline exists.

### 4.1 Data Provenance & Update Tracking

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| Add `source` field to `PhoneSpec` | Enum: `manufacturer`, `hands_on`, `community`, `estimated` | Low | P0 |
| Add `lastVerifiedAt` to `Phone` | Timestamp of last editorial verification | Low | P0 |
| Add `updatedBy` to `Phone` | Track who last modified this phone's data | Low | P0 |
| Spec change history | New `PhoneSpecHistory` table: `phoneId, specId, oldValue, newValue, changedBy, changedAt` | Medium | P0 |
| Display "Last updated" on phone pages | Show human-readable update date | Low | P0 |
| Display data source indicators | "Official specs" badge vs "Community data" badge | Low | P1 |

**Schema Addition**:
```prisma
model PhoneSpecHistory {
  id        String   @id @default(uuid())
  phoneId   String   @map("phone_id")
  specId    String   @map("spec_id")
  oldValue  String?  @map("old_value")
  newValue  String   @map("new_value")
  changedBy String   @map("changed_by")
  source    String   @default("admin") // admin, community, api, manufacturer
  createdAt DateTime @default(now()) @map("created_at")

  @@index([phoneId])
  @@index([specId])
  @@map("phone_spec_history")
}
```

### 4.2 Audit Log Enhancement

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| Enrich audit log with `oldValue` / `newValue` | Currently logs action, add before/after state | Medium | P0 |
| Audit log for all critical operations | Phone CRUD, spec changes, user changes, campaign changes, settings changes | Medium | P0 |
| Admin: Audit log viewer with filters | Filter by entity type, user, date range | Medium | P1 |
| Retention policy | Auto-archive audit logs older than 90 days | Low | P2 |

### 4.3 User Registration & Authentication

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| `/register` page | Email, password, name registration form | Medium | P0 |
| Email verification flow | Send verification email, confirm token | High | P0 |
| `/api/auth/register` endpoint | Create user with hashed password, send verification | Medium | P0 |
| Password reset flow | "Forgot password" → email → reset token → new password | High | P1 |
| User profile page | `/profile` — edit name, avatar, email preferences | Medium | P1 |
| OAuth providers (Google, GitHub) | Social login via NextAuth | Medium | P2 |

**Dependency**: Email service needed. Use Resend (free tier: 100 emails/day) or Nodemailer with SMTP.

### 4.4 User Review Submission

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| Review form on phone detail page | Star ratings per category, pros, cons, text review | High | P0 |
| Review moderation queue | Admin can approve/reject reviews | Medium | P0 |
| Review display on phone detail | Approved reviews shown with ratings, author, date | Medium | P0 |
| Helpful/unhelpful voting | Users can rate review usefulness | Medium | P1 |
| Aggregate score calculation | Compute overall score from approved review ratings | Medium | P1 |
| "Verified Purchase" placeholder | Boolean flag for future purchase verification integration | Low | P2 |

### 4.5 Content Moderation Foundation

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| Basic spam filter | Keyword list, link density check, rate limiting | Medium | P1 |
| Admin: Moderation queue page | List pending reviews/discussions, approve/reject actions | Medium | P1 |
| Report mechanism | "Report this review" button → admin queue | Low | P1 |
| Auto-publish rules | Reviews from trusted users (>5 approved reviews) auto-publish | Medium | P2 |

### Phase 4 — Dependency Chain

```
4.1 Data Provenance ──→ (independent, can start immediately)
4.2 Audit Enhancement ──→ (independent, parallel with 4.1)
4.3 User Registration ──→ 4.4 Review Submission ──→ 4.5 Moderation
                     └──→ (email service dependency)
```

### Phase 4 — Exit Checklist

- [ ] `PhoneSpecHistory` table captures every spec value change
- [ ] "Last updated: [date]" visible on all phone detail pages
- [ ] Users can register with email/password and receive verification email
- [ ] Registered users can submit reviews on phone pages
- [ ] Admin moderation queue shows pending reviews
- [ ] Admin can approve or reject reviews
- [ ] Approved reviews appear on phone detail pages with ratings
- [ ] Audit log captures who changed what and when for all phone edits

---

## 7. Execution Phase 5: Revenue-Readiness Architecture

**Goal**: Build the ad serving engine, placement logic, and campaign infrastructure so the platform is ready to onboard its first advertiser when traffic justifies it. Do not compromise UX.

**Duration**: 5-7 days  
**Prerequisites**: Phase 1 (validated APIs, auth middleware), Phase 2 (search — for sponsored search results)  
**Exit Criteria**: Admin can create a campaign with targeting, ad slots render on public pages, impressions are tracked, reporting dashboard shows metrics.

### 5.1 Ad Serving Engine

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| Create `src/lib/services/adServer.ts` | Core ad decision engine | High | P0 |
| Slot resolution logic | Given page type + context → find matching campaigns | High | P0 |
| Targeting evaluation | Match campaign targeting rules against page context | High | P0 |
| Budget enforcement | Check daily/total budget before serving | Medium | P0 |
| Frequency cap enforcement | Track user impressions via cookie/fingerprint | Medium | P1 |
| Priority + bid sorting | Prioritize higher-priority campaigns, then by bid amount | Medium | P0 |
| Fallback logic | No campaign → house ad → collapse slot | Low | P1 |

**Technical Detail — Ad Server Core**:
```typescript
// src/lib/services/adServer.ts
interface AdRequest {
  pageType: string;        // "phone_detail", "search", "homepage", etc.
  slotPosition: string;    // "sidebar_top", "in_content", "search_top"
  brandSlug?: string;      // Current page's brand context
  keywords?: string[];     // Search query terms
  country?: string;        // Geo from IP
  deviceType?: string;     // mobile, desktop, tablet
  userId?: string;         // For frequency capping
}

interface AdResponse {
  campaignId: string;
  creativeId: string;
  title: string;
  description?: string;
  image?: string;
  clickUrl: string;
  impressionToken: string; // For tracking
  isSponsored: true;       // Always true — transparency
}

export async function resolveAd(request: AdRequest): Promise<AdResponse | null> {
  // 1. Find active campaigns targeting this page type + position
  // 2. Filter by targeting rules (brand, keywords, geo, device)
  // 3. Filter by budget (not depleted)
  // 4. Filter by frequency cap (user hasn't seen too many)
  // 5. Sort by priority → bid amount → freshness
  // 6. Return top match or null
}
```

### 5.2 Ad Tracking System

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| Impression tracking endpoint | `POST /api/ads/impression` — record view | Medium | P0 |
| Click tracking endpoint | `GET /api/ads/click/[token]` — record click, redirect | Medium | P0 |
| Batch impression recording | Debounce client-side, send in batches | Medium | P1 |
| Bot detection | Basic user-agent filtering, suspicious pattern detection | Medium | P1 |
| Daily aggregation job | BullMQ job to aggregate impressions/clicks into `AdDailyStat` | Medium | P1 |

### 5.3 Ad Components

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| `<AdSlot>` component | Client component that fetches and renders an ad for a given slot | Medium | P0 |
| `<SponsoredPhoneCard>` | Native ad that looks like a PhoneCard with "Sponsored" label | Medium | P0 |
| `<BannerAd>` | Standard display ad with configurable dimensions | Medium | P0 |
| Integration into pages | Add `<AdSlot>` to phone detail sidebar, search results top, homepage | Medium | P0 |
| "Sponsored" label styling | Clear but non-intrusive labeling. Consistent across all ad formats. | Low | P0 |

### 5.4 Campaign Management (Admin)

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| Admin: Campaign creation form | Name, type, pricing model, budget, dates, targeting rules | High | P0 |
| Admin: Creative management | Upload/create ad creatives linked to campaigns | Medium | P0 |
| Admin: Campaign status management | Activate, pause, archive campaigns | Medium | P0 |
| Admin: Reporting dashboard | Impressions, clicks, CTR, spend by campaign, by day | High | P1 |

### 5.5 Brand Portal Foundation

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| `/company/dashboard` | Basic metrics: phone views, review count, campaign status | Medium | P1 |
| `/company/brand` | Edit brand profile, logo, description | Medium | P1 |
| `/company/campaigns` | View active campaigns, see basic reporting | Medium | P1 |
| Company registration flow | Admin invites company → company claims profile | Medium | P2 |

### Phase 5 — Exit Checklist

- [ ] Admin can create a campaign with targeting rules and budget
- [ ] `<AdSlot>` component renders ads on phone detail and search pages
- [ ] Impressions are recorded when ads are viewed
- [ ] Clicks redirect through tracking endpoint to destination URL
- [ ] Admin reporting dashboard shows impressions, clicks, CTR per campaign
- [ ] "Sponsored" label is clearly visible on all ad formats
- [ ] Ads do not render when no campaign matches (clean fallback)
- [ ] Company portal shows basic brand metrics

---

## 8. Execution Phase 6: First Strategic Moat Layer

**Goal**: Build the three highest-leverage differentiators that transform raw data into user value, trust, and SEO compounding.

**Duration**: 7-10 days  
**Prerequisites**: Phases 1-3 complete (data, search, SEO infrastructure)  
**Exit Criteria**: Decision Engine returns personalized recommendations, Spec IQ shows contextual intelligence on phone pages, Living Comparison Pages auto-generate and rank for "[Phone A] vs [Phone B]" queries.

### 6.1 Decision Engine v1

**What it does**: A guided wizard that asks users what they care about and recommends phones based on structured data matching.

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| `/find-my-phone` page | Multi-step wizard UI | High | P0 |
| Step 1: Budget selection | Under $300, $300-500, $500-800, $800-1200, $1200+ | Low | P0 |
| Step 2: Priority selection | Pick top 3: Camera, Battery, Performance, Display, 5G, Storage, Compact Size, Lightweight | Medium | P0 |
| Step 3: Brand preference | Any brand, or select preferred brands | Low | P0 |
| Step 4: Use case (optional) | Photography, Gaming, Business, Social Media, Basic use | Low | P1 |
| Recommendation engine | Score phones based on weighted spec matching | High | P0 |
| Results page | Ranked phones with explanations ("Best for photography in your budget") | High | P0 |

**Technical Detail — Scoring Algorithm**:
```typescript
interface UserPreferences {
  budget: { min: number; max: number };
  priorities: string[]; // ["camera", "battery", "performance"]
  brands?: string[];
  useCase?: string;
}

// Priority-to-spec mapping
const prioritySpecMap: Record<string, { specKey: string; direction: "higher" | "lower" }[]> = {
  camera: [
    { specKey: "main_camera", direction: "higher" },
    { specKey: "front_camera", direction: "higher" },
  ],
  battery: [
    { specKey: "battery", direction: "higher" },
    { specKey: "charger", direction: "higher" }, // Wattage
  ],
  performance: [
    { specKey: "ram", direction: "higher" },
    { specKey: "processor", direction: "higher" },
  ],
  display: [
    { specKey: "display_size", direction: "higher" },
    { specKey: "refresh_rate", direction: "higher" },
  ],
  compact: [
    { specKey: "display_size", direction: "lower" },
    { specKey: "weight", direction: "lower" },
  ],
};

// Score = sum of (percentile rank of each prioritized spec × priority weight)
// Weight: 1st priority = 3, 2nd = 2, 3rd = 1
function scorePhone(phone: PhoneWithSpecs, prefs: UserPreferences, percentiles: PercentileMap): number {
  let score = 0;
  prefs.priorities.forEach((priority, index) => {
    const weight = 3 - index; // 3, 2, 1
    const specs = prioritySpecMap[priority] || [];
    specs.forEach(({ specKey, direction }) => {
      const percentile = percentiles.get(phone.id, specKey) || 50;
      score += (direction === "higher" ? percentile : 100 - percentile) * weight;
    });
  });
  return score;
}
```

**Implementation approach**: 
1. Pre-compute percentile ranks for all numeric specs across all phones (batch job, cached in Redis)
2. At query time: filter by budget + brand → score against priorities → sort → return top 10
3. No LLM needed. Pure structured data matching. Fast, deterministic, explainable.

### 6.2 Spec IQ v1

**What it does**: Adds contextual intelligence annotations to every specification value on phone detail pages.

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| Percentile computation job | Calculate percentile rank for each spec across all published phones | High | P0 |
| `<SpecIQ>` component | Renders spec value + percentile badge + contextual insight | Medium | P0 |
| Percentile badge | "Top 10%", "Better than 82% of phones", "Below average" | Medium | P0 |
| Comparison reference | "vs. iPhone 15 Pro Max: 12% larger battery" | High | P1 |
| Price-tier context | Percentile within same price bracket, not just global | Medium | P1 |
| Admin: Toggle Spec IQ per spec | Some specs don't benefit from percentiles (e.g., colors) | Low | P1 |

**Technical Detail — Percentile Computation**:
```typescript
// Run as a scheduled job (daily) or after phone data changes
// Store results in Redis for fast retrieval

async function computeSpecPercentiles(): Promise<void> {
  const numericSpecs = await prisma.phoneSpec.findMany({
    where: {
      numericValue: { not: null },
      phone: { isPublished: true },
    },
    select: {
      phoneId: true,
      specId: true,
      numericValue: true,
      spec: { select: { key: true } },
    },
  });

  // Group by spec key
  const grouped = groupBy(numericSpecs, s => s.spec.key);

  for (const [specKey, values] of Object.entries(grouped)) {
    // Sort values ascending
    const sorted = values.sort((a, b) => (a.numericValue || 0) - (b.numericValue || 0));
    const total = sorted.length;

    sorted.forEach((item, index) => {
      const percentile = Math.round((index / total) * 100);
      // Store in Redis: speciq:{phoneId}:{specKey} = percentile
      redis.set(`speciq:${item.phoneId}:${specKey}`, percentile);
    });
  }
}
```

**Display Example**:
```
Battery: 5000 mAh
├── 🟢 Top 15% — Better than 85% of phones in our database
├── 📊 Estimated 1.5 days typical use
└── ↔️ vs. avg in $800-1200 range: +18%
```

### 6.3 Living Comparison Pages

**What it does**: Auto-generates permanent, SEO-optimized comparison pages for popular phone pairs. Updates when specs change. Rankable for "[Phone A] vs [Phone B]" queries.

| Deliverable | Details | Complexity | Priority |
|-------------|---------|------------|----------|
| `/compare/[slug1]-vs-[slug2]` route | Dynamic route for any two phones | Medium | P0 |
| Auto-generate comparison content | Grouped spec table, winner per category, overall verdict | High | P0 |
| SEO optimization | Unique title: "Samsung Galaxy S24 Ultra vs iPhone 15 Pro Max — Full Comparison" | Medium | P0 |
| JSON-LD for comparison | Structured data for comparison pages | Medium | P0 |
| "Winner" indicators | Highlight which phone wins each spec category | Medium | P0 |
| Community vote | "Which would you choose?" poll (registered users) | Medium | P1 |
| Popular comparisons index | `/compare` page showing trending comparisons | Medium | P1 |
| Auto-detection of popular pairs | Track which phones are compared together most often | Medium | P2 |
| Sitemap inclusion | All generated comparison pages in sitemap | Low | P1 |

**Technical Detail — Comparison Content Generation**:
```typescript
// Auto-generate verdict for each spec group
function generateGroupVerdict(phone1Specs: Spec[], phone2Specs: Spec[], groupName: string) {
  let phone1Wins = 0, phone2Wins = 0, ties = 0;

  // Compare numeric values where both phones have the same spec
  for (const p1Spec of phone1Specs) {
    const p2Spec = phone2Specs.find(s => s.specKey === p1Spec.specKey);
    if (!p2Spec || !p1Spec.numericValue || !p2Spec.numericValue) continue;

    if (p1Spec.numericValue > p2Spec.numericValue) phone1Wins++;
    else if (p2Spec.numericValue > p1Spec.numericValue) phone2Wins++;
    else ties++;
  }

  return { phone1Wins, phone2Wins, ties, winner: phone1Wins > phone2Wins ? 1 : phone2Wins > phone1Wins ? 2 : 0 };
}
```

**URL Strategy**:
- Canonical URL: alphabetically sorted slugs → `/compare/iphone-15-pro-max-vs-samsung-galaxy-s24-ultra`
- Redirects: `/compare/samsung-galaxy-s24-ultra-vs-iphone-15-pro-max` → canonical
- This prevents duplicate content and ensures one authoritative URL per comparison

### Phase 6 — Exit Checklist

- [ ] `/find-my-phone` wizard guides users through budget → priorities → brand → recommendations
- [ ] Recommendations are scored and ranked with explanations
- [ ] Phone detail pages show Spec IQ percentile badges on numeric specs
- [ ] `/compare/phone-a-vs-phone-b` generates a unique comparison page
- [ ] Comparison pages include group winners, spec-by-spec comparison, and overall verdict
- [ ] Comparison page URLs are canonical (alphabetically sorted)
- [ ] All three features are responsive and work on mobile
- [ ] Comparison pages and phone finder are included in sitemap

---

## 9. Cross-Cutting Concerns

These concerns apply across all phases and should be maintained continuously.

### 9.1 Code Quality Standards

| Standard | Rule | Enforcement |
|----------|------|-------------|
| **TypeScript** | Strict mode. No `any` in new code. | `tsconfig.json` strict: true |
| **Imports** | Absolute imports via `@/` prefix | Path aliases in `tsconfig.json` |
| **Components** | Server Components by default. `"use client"` only when needed. | Code review |
| **Data Fetching** | Server Components fetch data directly. Client Components use SWR/fetch. | Convention |
| **Error Handling** | All API routes wrapped in try/catch with structured error responses | Convention |
| **Validation** | All mutation inputs validated with Zod before database operations | Convention |

### 9.2 Monitoring & Observability (set up in Phase 1, expand over time)

| Concern | Tool | Priority |
|---------|------|----------|
| Error tracking | Sentry free tier — captures runtime errors with stack traces | P1 (Phase 1) |
| Performance monitoring | Vercel Analytics (included) — Web Vitals, page-level metrics | P0 (Phase 1) |
| Uptime monitoring | UptimeRobot free tier — HTTP checks every 5 minutes | P1 (Phase 1) |
| Search monitoring | Meilisearch dashboard — query latency, index health | P0 (Phase 2) |
| Ad reporting | Custom dashboard — impressions, clicks, revenue | P0 (Phase 5) |

### 9.3 Testing Strategy

| Level | Scope | Tool | When |
|-------|-------|------|------|
| **Smoke Tests** | All public pages render without errors | Playwright | Phase 1+ |
| **API Tests** | All mutation endpoints validate and reject bad input | Vitest | Phase 1+ |
| **Search Tests** | Meilisearch returns expected results for known queries | Vitest | Phase 2+ |
| **Visual Tests** | Screenshots at key breakpoints for regression detection | Playwright | Phase 1+ |
| **E2E Tests** | Critical flows: search → compare → phone detail | Playwright | Phase 3+ |

---

## 10. Dependency Graph

Complete inter-phase dependency visualization:

```
PHASE 1: Foundation Hardening
├── 1.1 PostgreSQL Migration ◄── (BLOCKING: all phases need this)
├── 1.2 Next.js Config
├── 1.3 Middleware Auth
├── 1.4 Error/Loading States
├── 1.5 API Validation (Zod)
├── 1.6 Responsive Polish
└── 1.7 Performance Baseline
     │
     ├─────────────────────────────────────────────────────┐
     │                                                     │
     ▼                                                     ▼
PHASE 2: Search Infrastructure                   PHASE 3: SEO Infrastructure
├── 2.1 Meilisearch Setup                       ├── 3.1 JSON-LD
├── 2.2 Sync Pipeline                           ├── 3.2 Meta Tags
├── 2.3 Autocomplete UI                         ├── 3.3 Sitemap & Robots
├── 2.4 Search Results Page                     ├── 3.4 Programmatic SEO Pages
└── 2.5 Search Analytics                        └── 3.5 Breadcrumbs
     │                                                     │
     ├─────────────────┐               ┌───────────────────┘
     │                 │               │
     ▼                 ▼               ▼
PHASE 4: Trust        PHASE 5: Revenue    (Phases 4 & 5 can run
├── 4.1 Provenance    ├── 5.1 Ad Engine    in parallel after 1-3)
├── 4.2 Audit         ├── 5.2 Tracking
├── 4.3 User Reg.     ├── 5.3 Components
├── 4.4 Reviews       ├── 5.4 Admin Campaigns
└── 4.5 Moderation    └── 5.5 Brand Portal
                           │
     ┌─────────────────────┤
     │                     │
     ▼                     ▼
PHASE 6: Moat Layer
├── 6.1 Decision Engine (needs: Phase 1 data + Phase 2 search)
├── 6.2 Spec IQ (needs: Phase 1 data + percentile computation)
└── 6.3 Living Comparisons (needs: Phase 1 data + Phase 3 SEO)
```

**Parallelization Opportunities**:
- Phases 2 and 3 can run **in parallel** after Phase 1
- Phases 4 and 5 can run **in parallel** after Phases 2-3
- Within Phase 6, all three deliverables can be built **in parallel**

---

## 11. Risk Register

| # | Risk | Probability | Impact | Mitigation | Phase |
|---|------|-------------|--------|------------|-------|
| R1 | PostgreSQL migration breaks queries | Low | High | Prisma abstracts SQL; run full test suite after migration | 1 |
| R2 | Meilisearch latency in production | Medium | High | Fallback to Prisma full-text search; load test with 1000+ documents | 2 |
| R3 | JSON-LD validation errors | Medium | Medium | Test with Google Rich Results Test tool before deploy | 3 |
| R4 | Email service rate limits block registration | Medium | Medium | Use Resend (100/day free) or queue emails via BullMQ | 4 |
| R5 | Ad serving adds page load latency | Medium | High | Fetch ads async (client-side), lazy-load below fold | 5 |
| R6 | Percentile computation is slow with 10K+ phones | Low | Medium | Pre-compute daily via BullMQ job, cache in Redis | 6 |
| R7 | Vercel deployment fails (Root Directory issue) | High | High | Fix Vercel project config before Phase 1 starts | 1 |
| R8 | Sharp + Vercel serverless memory limits | Medium | Medium | Cap upload size at 10MB, resize before Sharp processing | 1 |
| R9 | User reviews attract spam on launch | Medium | Medium | Require email verification, start with manual moderation | 4 |
| R10 | Programmatic SEO pages create thin content | Medium | Medium | Add editorial introductions, minimum spec count requirements | 3 |

---

## 12. Milestone Schedule

### Summary Timeline

| Phase | Duration | Start | End | Key Milestone |
|-------|----------|-------|-----|---------------|
| **Phase 1**: Foundation | 5-7 days | Week 1 | Week 1-2 | Production-deployable platform |
| **Phase 2**: Search | 5-7 days | Week 2 | Week 3 | Meilisearch-powered search live |
| **Phase 3**: SEO | 5-7 days | Week 2-3 | Week 4 | Rich snippets + sitemap + programmatic pages |
| **Phase 4**: Trust | 4-5 days | Week 4 | Week 5 | User registration + reviews + provenance |
| **Phase 5**: Revenue | 5-7 days | Week 4-5 | Week 6 | Ad serving + brand portal |
| **Phase 6**: Moat | 7-10 days | Week 6 | Week 8 | Decision Engine + Spec IQ + Living Comparisons |

### Critical Path

```
Week 1:  Phase 1 (Foundation) ─────────────────►
Week 2:  Phase 2 (Search) ─────► Phase 3 (SEO) ─────►
Week 3:  Phase 2 cont'd ───────► Phase 3 cont'd ────►
Week 4:  Phase 4 (Trust) ──────► Phase 5 (Revenue) ──►
Week 5:  Phase 4 cont'd ───────► Phase 5 cont'd ────►
Week 6:  Phase 6 (Moat) ──────────────────────────────►
Week 7:  Phase 6 cont'd ──────────────────────────────►
Week 8:  Phase 6 cont'd + Integration Testing ────────►
```

### Definition of Done — Full Build Program

When this blueprint is fully executed, the platform will:

1. **Deploy to production** on Vercel with PostgreSQL and Meilisearch
2. **Pass Lighthouse > 90** on all public pages
3. **Search with typo tolerance** and faceted filters in < 50ms
4. **Render rich snippets** in Google search results (Product, Breadcrumb, FAQ)
5. **Serve ads** without degrading page performance or user trust
6. **Accept user reviews** with moderation and trust signals
7. **Track every data change** with full audit trail and provenance
8. **Recommend phones** based on user priorities (Decision Engine)
9. **Contextualize specs** with percentile intelligence (Spec IQ)
10. **Auto-generate comparison pages** that rank for "[A] vs [B]" queries

This is a platform that users trust, brands invest in, and search engines reward.

---

*This execution blueprint translates the MobilePlatform strategy into a concrete, dependency-aware, risk-mitigated build program. Every deliverable is technically specified, sequenced by priority, and designed for execution by a focused engineering team.*
