# Search Architecture — Meilisearch Integration

## Overview

MobilePlatform uses **Meilisearch** as a search engine for fast, typo-tolerant full-text search across phones and brands. PostgreSQL remains the **source of truth** — Meilisearch is a read-only search projection that can be fully rebuilt from the database at any time.

### V1 Scope

| Supported | Not Supported (V2+) |
|-----------|---------------------|
| Phone search (full-text, filters, sort, facets) | Article search |
| Brand search (autocomplete) | Multi-entity unified search |
| Autocomplete (phones + brands) | Async queue-based indexing |
| PostgreSQL fallback when Meilisearch is down | Geo-based search |
| Admin full reindex | Search analytics dashboard (advanced) |
| Automatic indexing on CRUD operations | Per-user search personalization |
| Structured logging | Prometheus/Grafana metrics |

---

## Module Structure

```
src/lib/search/
├── index.ts                  # Public API — all imports go through here
├── search-client.ts          # Meilisearch SDK adapter (single point of SDK interaction)
├── search-service.ts         # Query orchestration (search, autocomplete, fallback)
├── search-indexer.ts         # Document lifecycle (upsert, delete, reindex)
├── search-config.ts          # Index configuration (attributes, ranking, synonyms)
├── search-logger.ts          # Structured logging for all search operations
├── mappers/
│   ├── phone-mapper.ts       # Prisma Phone → PhoneSearchDocument (pure function)
│   └── brand-mapper.ts       # Prisma Brand → BrandSearchDocument (pure function)
├── types/
│   ├── documents.ts          # Search document interfaces + index names
│   ├── requests.ts           # Request DTOs + validation + parsing
│   └── responses.ts          # Response DTOs
└── __tests__/
    ├── phone-mapper.test.ts  # Mapper unit tests
    ├── brand-mapper.test.ts  # Mapper unit tests
    ├── search-requests.test.ts    # Request validation tests
    └── search-integration.test.ts # End-to-end search tests
```

### Responsibility Separation

| Component | Responsibility | Does NOT do |
|-----------|---------------|-------------|
| **SearchClient** | Wraps Meilisearch SDK, handles connection | Business logic, Prisma queries |
| **SearchService** | Orchestrates queries, builds filters, handles fallback | Indexing, direct SDK calls |
| **SearchIndexer** | Document upsert/delete/reindex | Query execution, HTTP handling |
| **Mappers** | Pure entity→document transformation | DB queries, SDK calls |
| **SearchLogger** | Structured logging with context | Business logic |
| **API Routes** | HTTP request/response handling | Search logic, Meilisearch SDK |

---

## Search API

### `GET /api/search`

Full phone search with filters, sorting, pagination, and faceted results.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | `""` | Search query (max 200 chars). Empty = browse all |
| `page` | number | `1` | Page number (min 1) |
| `limit` | number | `20` | Results per page (max 100) |
| `sort` | string | `""` | Sort key (see table below) |
| `brand` | string | | Comma-separated brand slugs |
| `status` | string | | Market status filter |
| `priceMin` | number | | Minimum price USD |
| `priceMax` | number | | Maximum price USD |
| `ramMin` | number | | Minimum RAM (GB) |
| `batteryMin` | number | | Minimum battery (mAh) |
| `displayMin` | number | | Minimum display size (inches) |
| `storageMin` | number | | Minimum storage (GB) |

**Valid Sort Keys:**

| Key | Meilisearch Sort |
|-----|-----------------|
| `price_asc` | `priceNumeric:asc` |
| `price_desc` | `priceNumeric:desc` |
| `name_asc` | `name:asc` |
| `name_desc` | `name:desc` |
| `newest` | `createdAt:desc` |
| `battery` | `batteryNumeric:desc` |
| `display` | `displaySizeNumeric:desc` |
| `ram` | `ramNumeric:desc` |
| `storage` | `storageNumeric:desc` |

**Response:**

```json
{
  "success": true,
  "data": [{ "id": "...", "name": "...", "brandName": "...", ... }],
  "facets": {
    "brandName": { "Samsung": 3, "Apple": 2 },
    "marketStatus": { "available": 5 }
  },
  "pagination": { "page": 1, "limit": 20, "total": 6, "totalPages": 1 },
  "meta": {
    "query": "samsung",
    "processingTimeMs": 2,
    "responseTimeMs": 15,
    "fallback": false
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 400 | Invalid sort key |
| 503 | Meilisearch unavailable AND PostgreSQL fallback also failed |

### `GET /api/search/autocomplete?q=sam`

Fast autocomplete searching both phones and brands in parallel.

### `POST /api/search/track`

Click tracking for search analytics. Body: `{ "query": "...", "slug": "..." }`

### `POST /api/admin/search/reindex`

Admin-only full reindex. Requires authentication. Reconfigures indexes and rebuilds all documents from DB.

---

## Searchable / Filterable / Sortable Fields

### Phones Index (`phones`)

| Field | Searchable | Filterable | Sortable | Displayed |
|-------|-----------|-----------|---------|----------|
| name | Rank 1 | | Yes | Yes |
| brandName | Rank 2 | Yes | | Yes |
| overview | Rank 3 | | | Yes (cropped) |
| processor | Rank 4 | | | Yes |
| displayType | Rank 5 | Yes | | Yes |
| os | Rank 6 | Yes | | Yes |
| mainCamera | Rank 7 | | | Yes |
| ram | Rank 8 | Yes | Yes | Yes |
| storage | Rank 9 | Yes | Yes | Yes |
| brandSlug | | Yes | | Yes |
| marketStatus | | Yes | | Yes |
| priceNumeric | | Yes (range) | Yes | Yes |
| batteryNumeric | | Yes (range) | Yes | |
| displaySizeNumeric | | Yes (range) | Yes | |
| isFeatured | | Yes | | Yes |

### Brands Index (`brands`)

| Field | Searchable | Filterable | Sortable |
|-------|-----------|-----------|---------|
| name | Rank 1 | | Yes |
| description | Rank 2 | | |
| phoneCount | | Yes | Yes |

---

## Indexing

### When Indexing Happens

| Event | Action | Sync/Async |
|-------|--------|-----------|
| Phone created (published) | `indexPhone(id)` | Fire-and-forget |
| Phone specs updated | `indexPhone(id)` | Fire-and-forget |
| Phone unpublished/deleted | `removePhone(id)` | Fire-and-forget |
| Brand created | `indexBrand(id)` | Fire-and-forget |
| Brand updated | `indexBrand(id)` | Fire-and-forget |
| Brand deleted | `removeBrand(id)` | Fire-and-forget |
| Admin reindex | `fullReindex()` | Synchronous (admin waits) |

### Fire-and-Forget Pattern

```
DB write succeeds (source of truth) →
  indexPhone(id).catch(() => {})  ← never blocks response
```

If indexing fails:
- The DB write still succeeds (data integrity preserved)
- The failure is logged with structured context
- Admin can trigger `fullReindex()` to recover

### Visibility Rules

- **Phones**: Only `isPublished: true` phones are indexed
- **Brands**: Only `isActive: true` brands are indexed
- Unpublishing or deactivating removes the document from the index

### Reindex

```bash
# Via script
npx tsx scripts/search-bootstrap.ts

# Via API (requires admin auth)
curl -X POST http://localhost:3000/api/admin/search/reindex \
  -H "Cookie: next-auth.session-token=..."
```

Reindex is:
- **Idempotent** — safe to run repeatedly
- **Atomic per index** — clears all docs, then re-adds
- **Reconfigures indexes** — applies latest searchable/filterable/sortable settings

---

## Failure Behavior

| Scenario | System Behavior |
|----------|----------------|
| Meilisearch down during **search** | PostgreSQL fallback — returns basic results with `meta.fallback: true` |
| Meilisearch down during **autocomplete** | PostgreSQL fallback — returns phone name matches only |
| Meilisearch down during **indexing** | Logged as non-fatal error. DB is source of truth. Admin can reindex when service recovers |
| Meilisearch down during **reindex** | Returns 503 with clear error message |
| Invalid sort key | Returns 400 with list of valid options |
| Empty query | Returns all published phones (browse mode) |
| No results | Returns `{ data: [], pagination: { total: 0 } }` |

### PostgreSQL Fallback Limitations

When in fallback mode:
- No faceted search (facets = `{}`)
- No typo tolerance
- No highlighting
- Basic `ILIKE` text matching only
- Sort defaults to `createdAt DESC`

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MEILISEARCH_URL` | No | `http://localhost:7700` | Meilisearch server URL |
| `MEILISEARCH_MASTER_KEY` | No | `mp_dev_master_key_change_in_production` | API key (CHANGE IN PRODUCTION) |

### Docker Setup

Meilisearch runs as a Docker container defined in `docker-compose.yml`:

```bash
docker compose up -d   # Start Meilisearch + PostgreSQL + Redis
```

---

## Adding a New Entity to Search

To add a new entity (e.g., Articles) to search in a future version:

1. **Define document type** in `types/documents.ts`:
   ```typescript
   export interface ArticleSearchDocument { ... }
   export const INDEX_NAMES = { ..., ARTICLES: "articles" };
   ```

2. **Create mapper** in `mappers/article-mapper.ts`:
   ```typescript
   export function mapArticleToDocument(article: ArticleWithRelations): ArticleSearchDocument { ... }
   ```

3. **Add index config** in `search-config.ts`:
   ```typescript
   export async function configureArticleIndex() { ... }
   ```

4. **Add indexer functions** in `search-indexer.ts`:
   ```typescript
   export async function indexArticle(id: string) { ... }
   export async function reindexAllArticles() { ... }
   ```

5. **Add search function** in `search-service.ts`:
   ```typescript
   export async function searchArticles(request: SearchRequest) { ... }
   ```

6. **Wire up CRUD hooks** in the admin API routes

7. **Update `fullReindex()`** to include the new index

8. **Add tests** in `__tests__/`

9. **Re-export** from `index.ts`

---

## Observability

All search operations produce structured logs with the format:

```
[Search:{operation}] {message} {key=value, ...}
```

### Log Examples

```
[Search:query] Search completed: "samsung" → 3 hits {duration=12ms}
[Search:index] Document upserted {index=phones, docId=abc-123}
[Search:index] Document upsert failed (non-fatal, DB is source of truth) {index=phones, docId=abc-123, error="..."}
[Search:reindex] Full reindex complete {duration=380ms, docs=14, phones=6, brands=8}
[Search:query] Meilisearch unavailable — using fallback {error="..."}
```

### Future Observability (V2)

Integration points for metrics:
- `search-service.ts` → query latency, hit count, fallback rate
- `search-indexer.ts` → indexing success/failure rate, reindex duration
- `search-logger.ts` → extend to emit to external logging service

---

## V2 Roadmap

1. **Article search** — Add articles to search with category/tag filtering
2. **Async indexing** — Move to a queue (Bull/BullMQ) for background indexing
3. **Search suggestions** — "Did you mean?" and popular queries
4. **Search analytics dashboard** — Query patterns, zero-result queries, click-through rates
5. **Advanced ranking** — Custom ranking rules based on popularity, recency, review scores
6. **Multi-index search** — Unified search across phones + articles + brands
7. **Geo search** — Search by showroom location
8. **Rate limiting** — Per-IP rate limiting for search endpoints
9. **Search result caching** — Redis cache for popular queries
