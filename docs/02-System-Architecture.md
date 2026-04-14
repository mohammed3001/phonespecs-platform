# System Architecture Document
# MobilePlatform

---

## 1. Architecture Overview

MobilePlatform follows a **monolithic Next.js architecture** with clear module separation, designed for simplicity, performance, and future scalability.

```
┌─────────────────────────────────────────────────────────┐
│                    CDN (Static Assets)                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Public UI   │  │  Admin Panel │  │Company Portal│  │
│  │  (Next.js SSR)│  │  (Next.js)   │  │  (Next.js)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
│  ┌──────┴─────────────────┴──────────────────┴───────┐  │
│  │              Next.js API Routes                    │  │
│  │         (REST API + Server Actions)                │  │
│  ├────────────────────────────────────────────────────┤  │
│  │                                                    │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │  │
│  │  │  Auth    │ │  Media   │ │  Ad Engine        │   │  │
│  │  │  Module  │ │  Module  │ │  (Campaigns,      │   │  │
│  │  │          │ │  (Sharp) │ │   Tracking,       │   │  │
│  │  └──────────┘ └──────────┘ │   Reporting)      │   │  │
│  │                            └──────────────────┘   │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │  │
│  │  │  SEO     │ │  Search  │ │  Payment          │   │  │
│  │  │  Engine  │ │  Module  │ │  Module           │   │  │
│  │  └──────────┘ └──────────┘ └──────────────────┘   │  │
│  │                                                    │  │
│  └──────┬──────────────┬──────────────┬──────────────┤  │
│         │              │              │               │  │
│  ┌──────┴──────┐ ┌─────┴─────┐ ┌─────┴──────┐       │  │
│  │ PostgreSQL  │ │   Redis   │ │ Meilisearch│       │  │
│  │  (Prisma)   │ │  (Cache + │ │  (Search)  │       │  │
│  │             │ │   Queue)  │ │            │       │  │
│  └─────────────┘ └───────────┘ └────────────┘       │  │
│                                                      │  │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Application Layers

### 2.1 Presentation Layer
Three separate Next.js route groups:
- **`/(public)`** — Public-facing website (SSR/SSG)
- **`/admin`** — Admin dashboard (client-side, protected)
- **`/company`** — Company/brand portal (client-side, protected)

### 2.2 API Layer
- **Next.js API Routes** (`/api/...`) for RESTful endpoints
- **Server Actions** for form submissions and mutations
- **Middleware** for authentication, rate limiting, CORS

### 2.3 Service Layer
Business logic modules:
- `PhoneService` — Phone CRUD, specs, variants
- `BrandService` — Brand management
- `ArticleService` — Articles, news, reviews
- `SearchService` — Search indexing and queries
- `AdService` — Campaign management, ad serving, tracking
- `SeoService` — Meta generation, sitemaps, structured data
- `MediaService` — Image upload, optimization, gallery
- `AuthService` — Authentication, authorization, roles
- `PaymentService` — Payment processing (modular adapters)
- `AuditService` — Activity logging
- `CacheService` — Cache management
- `QueueService` — Background job processing

### 2.4 Data Layer
- **Prisma ORM** for database access
- **Redis** for caching and session storage
- **Meilisearch** for full-text search

---

## 3. Directory Structure

```
mobileplatform/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Seed data
├── src/
│   ├── app/
│   │   ├── (public)/          # Public website routes
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── phones/        # Phone listing & detail
│   │   │   ├── compare/       # Comparison pages
│   │   │   ├── news/          # News articles
│   │   │   ├── reviews/       # Reviews
│   │   │   ├── brands/        # Brand pages
│   │   │   ├── discussions/   # Discussion forums
│   │   │   ├── showrooms/     # Showroom listings
│   │   │   └── search/        # Search results
│   │   ├── admin/             # Admin panel routes
│   │   │   ├── dashboard/
│   │   │   ├── phones/
│   │   │   ├── brands/
│   │   │   ├── articles/
│   │   │   ├── categories/
│   │   │   ├── tags/
│   │   │   ├── media/
│   │   │   ├── users/
│   │   │   ├── companies/
│   │   │   ├── advertisers/
│   │   │   ├── campaigns/
│   │   │   ├── settings/
│   │   │   ├── seo/
│   │   │   ├── menus/
│   │   │   ├── pages/
│   │   │   ├── roles/
│   │   │   └── audit-log/
│   │   ├── company/           # Company portal routes
│   │   │   ├── dashboard/
│   │   │   ├── campaigns/
│   │   │   ├── showrooms/
│   │   │   ├── materials/
│   │   │   └── reports/
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   ├── phones/
│   │   │   ├── brands/
│   │   │   ├── articles/
│   │   │   ├── search/
│   │   │   ├── ads/
│   │   │   ├── media/
│   │   │   ├── seo/
│   │   │   └── payments/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── public/            # Public UI components
│   │   ├── admin/             # Admin UI components
│   │   ├── company/           # Company portal components
│   │   └── shared/            # Shared components
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   ├── redis.ts           # Redis client
│   │   ├── meilisearch.ts     # Meilisearch client
│   │   ├── auth.ts            # Auth configuration
│   │   ├── cache.ts           # Cache utilities
│   │   └── queue.ts           # Queue configuration
│   ├── services/
│   │   ├── phone.service.ts
│   │   ├── brand.service.ts
│   │   ├── article.service.ts
│   │   ├── search.service.ts
│   │   ├── ad.service.ts
│   │   ├── seo.service.ts
│   │   ├── media.service.ts
│   │   ├── auth.service.ts
│   │   ├── payment.service.ts
│   │   ├── audit.service.ts
│   │   └── cache.service.ts
│   ├── types/                 # TypeScript types
│   └── utils/                 # Utility functions
├── public/                    # Static assets
├── docs/                      # Documentation
└── package.json
```

---

## 4. Authentication & Authorization

### Architecture
- **NextAuth.js** with credentials provider (email/password)
- **JWT tokens** for session management
- **Role-based access control (RBAC)**

### Roles
| Role | Access |
|------|--------|
| `super_admin` | Full access to everything |
| `admin` | Full admin panel access |
| `editor` | Content management (phones, articles, reviews) |
| `moderator` | Discussion moderation, user management |
| `company_admin` | Full company portal access |
| `company_member` | Limited company portal access |
| `user` | Public site features (reviews, discussions) |

### Permission System
Granular permissions attached to roles:
- `phones.create`, `phones.edit`, `phones.delete`, `phones.publish`
- `articles.create`, `articles.edit`, `articles.delete`, `articles.publish`
- `campaigns.create`, `campaigns.edit`, `campaigns.manage`
- `settings.view`, `settings.edit`
- `users.manage`, `roles.manage`
- etc.

---

## 5. Caching Strategy

### Multi-Layer Cache
1. **CDN Cache** — Static assets, images (via headers)
2. **Redis Cache** — API responses, computed data
3. **Next.js Cache** — ISR (Incremental Static Regeneration) for public pages
4. **In-Memory Cache** — Hot configuration data

### Cache Invalidation
- **Tag-based invalidation**: Changes to a phone invalidate all related caches
- **TTL-based**: Different TTLs for different data types
  - Settings: 1 hour
  - Phone data: 15 minutes
  - Search results: 5 minutes
  - Ad data: 1 minute

---

## 6. Queue & Background Jobs

Using **BullMQ** with Redis:

| Job | Priority | Description |
|-----|----------|-------------|
| `search.index` | High | Index/update Meilisearch on data change |
| `media.optimize` | Medium | Resize, convert images to WebP/AVIF |
| `sitemap.generate` | Low | Regenerate XML sitemaps |
| `ads.aggregate` | Medium | Aggregate impression/click stats |
| `email.send` | High | Send transactional emails |
| `audit.log` | Low | Write audit log entries |
| `seo.generate` | Low | Generate programmatic SEO pages |
| `cache.warm` | Low | Pre-warm caches after invalidation |

---

## 7. Media Pipeline

```
Upload → Validate → Store Original → Queue Processing
                                         │
                        ┌────────────────┤
                        ▼                ▼
                   Generate           Generate
                   Thumbnails         WebP/AVIF
                   (multiple          variants
                    sizes)
                        │                │
                        └────────┬───────┘
                                 ▼
                          Store in
                          /uploads/
                          directory
```

Image sizes generated:
- Thumbnail: 150x150
- Small: 300x300
- Medium: 600x600
- Large: 1200x1200
- Original: preserved

---

## 8. Error Handling & Monitoring

### Error Tracking
- Custom error boundary components in React
- API error middleware with structured error responses
- Error logging to database with stack traces
- Admin dashboard widget showing recent errors

### Performance Monitoring
- API response time tracking
- Database query performance logging
- Cache hit/miss ratios
- Search query performance

### Health Checks
- `/api/health` endpoint for uptime monitoring
- Database connectivity check
- Redis connectivity check
- Meilisearch connectivity check

---

## 9. Security

- **HTTPS everywhere**
- **CSRF protection** via Next.js built-in
- **SQL injection prevention** via Prisma parameterized queries
- **XSS prevention** via React's built-in escaping + CSP headers
- **Rate limiting** on API endpoints
- **Input validation** with Zod schemas
- **File upload validation** (type, size, dimensions)
- **Authentication middleware** on protected routes
- **Audit logging** for all admin actions
- **Password hashing** with bcrypt
- **Secure headers** (HSTS, X-Frame-Options, etc.)

---

## 10. Deployment Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│   Client     │────▶│  Reverse     │────▶│  Next.js   │
│   Browser    │     │  Proxy       │     │  Server    │
└─────────────┘     │  (nginx)     │     │  (Node.js) │
                    └──────────────┘     └──────┬─────┘
                                               │
                    ┌──────────────────────────┤
                    ▼              ▼            ▼
              ┌──────────┐ ┌──────────┐ ┌────────────┐
              │PostgreSQL│ │  Redis   │ │Meilisearch │
              └──────────┘ └──────────┘ └────────────┘
```

### Scaling Options
- **Horizontal**: Multiple Next.js instances behind load balancer
- **Database**: Read replicas for heavy read workloads
- **Cache**: Redis cluster for high-traffic scenarios
- **Search**: Meilisearch can handle millions of documents
