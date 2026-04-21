# Search Architecture
# MobilePlatform

---

## 1. Search Engine: Meilisearch

### Why Meilisearch?
- **Typo tolerance** built-in (handles misspellings)
- **Instant search** (< 50ms response time)
- **Faceted search** (filters & counts)
- **Easy setup** and maintenance
- **RESTful API**
- **Relevancy customization**

---

## 2. Search Indexes

### 2.1 Phones Index
```json
{
  "uid": "phones",
  "primaryKey": "id",
  "searchableAttributes": [
    "name",
    "brand_name",
    "overview",
    "specs_text"
  ],
  "filterableAttributes": [
    "brand_slug",
    "market_status",
    "price_usd",
    "release_year",
    "is_published",
    "spec_ram",
    "spec_storage",
    "spec_battery",
    "spec_display_size",
    "spec_main_camera"
  ],
  "sortableAttributes": [
    "name",
    "price_usd",
    "release_date",
    "review_score",
    "view_count",
    "created_at"
  ],
  "displayedAttributes": [
    "id", "name", "slug", "brand_name", "brand_slug",
    "main_image", "price_usd", "price_display",
    "market_status", "release_date", "review_score",
    "key_specs", "extra_specs", "updated_at"
  ],
  "rankingRules": [
    "words",
    "typo",
    "proximity",
    "attribute",
    "sort",
    "exactness",
    "review_score:desc"
  ]
}
```

### 2.2 Articles Index
```json
{
  "uid": "articles",
  "primaryKey": "id",
  "searchableAttributes": [
    "title",
    "excerpt",
    "content_text",
    "category_name",
    "tag_names"
  ],
  "filterableAttributes": [
    "type",
    "status",
    "category_slug",
    "published_at"
  ],
  "sortableAttributes": [
    "published_at",
    "view_count"
  ]
}
```

### 2.3 Brands Index
```json
{
  "uid": "brands",
  "primaryKey": "id",
  "searchableAttributes": ["name", "description"],
  "filterableAttributes": ["is_active"],
  "sortableAttributes": ["name", "phone_count"]
}
```

---

## 3. Search Features

### 3.1 Autocomplete
```
User types: "sam gal"
→ Suggestions:
  - Samsung Galaxy S24 Ultra
  - Samsung Galaxy A55
  - Samsung Galaxy Z Fold 5
  → "See all results for 'sam gal'" link
```

Implementation:
- Debounced API calls (300ms)
- Meilisearch prefix search
- Top 5 phone suggestions + top 3 article suggestions
- Category/brand quick links

### 3.2 Search Results Page
```
┌─────────────────────────────────────────────────────┐
│  Search: "samsung galaxy"                    🔍     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─ Filters ──┐  ┌─ Results ──────────────────────┐│
│  │            │  │                                 ││
│  │ Brand      │  │ [Sponsored] Samsung Galaxy S24  ││
│  │ □ Samsung  │  │ ┌──────────────────────────────┐││
│  │ □ Apple    │  │ │ 📱 Samsung Galaxy S24 Ultra  │││
│  │            │  │ │ $1,299 | Available           │││
│  │ Price      │  │ │ ⭐ 9.2 | Updated: Jan 2024  │││
│  │ $0 - $2000│  │ │ ────────────────────────────  │││
│  │            │  │ │ 💾 256GB  🧠 12GB RAM        │││
│  │ RAM        │  │ │ 📷 200MP  🤳 12MP            │││
│  │ □ 8GB     │  │ │ 📺 6.8"   🔋 5000mAh        │││
│  │ □ 12GB    │  │ │ ────────────────────────────  │││
│  │            │  │ │ 👆 Fingerprint (Ultrasonic)  │││
│  │ Battery    │  │ │ ⚡ 45W   💧 IP68             │││
│  │ □ 4000+   │  │ │ 📶 Wi-Fi 7  🛡️ Gorilla Armor│││
│  │ □ 5000+   │  │ │ 📡 Bluetooth 5.3             │││
│  │            │  │ └──────────────────────────────┘││
│  │ Sort By    │  │                                 ││
│  │ ◉ Relevant│  │ [Next phone card...]            ││
│  │ ○ Price ↑ │  │                                 ││
│  │ ○ Price ↓ │  │ Pagination: < 1 2 3 ... 10 >   ││
│  │ ○ Newest  │  │                                 ││
│  │ ○ Rating  │  │                                 ││
│  └───────────┘  └─────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### 3.3 Faceted Filters
Dynamic filters based on spec definitions marked as `is_filterable`:
- Brand (multi-select)
- Price Range (slider)
- Market Status (multi-select)
- RAM (multi-select)
- Storage (multi-select)
- Battery (range)
- Display Size (range)
- Camera (range)
- Release Year (multi-select)

### 3.4 Search Analytics
Track and analyze:
- Top search queries
- Queries with no results
- Click-through rates
- Search-to-conversion paths
- Popular filters used
- Average results per query

### 3.5 Query Rewrite Rules
Admin-configurable rules:
```
"iphone" → "apple iphone"
"s24" → "samsung galaxy s24"
"best camera phone" → filter: camera > 100MP, sort: review_score
```

### 3.6 Search Landing Pages
For important keywords, admin can create custom landing pages:
- Custom title and description
- Curated phone selection
- SEO-optimized content
- Sponsored placements

---

## 4. Indexing Strategy

### Real-time Sync
- When a phone/article is created/updated/deleted:
  1. Save to PostgreSQL
  2. Queue a job to update Meilisearch index
  3. BullMQ worker processes the job
  4. Index is updated within seconds

### Full Re-index
- Admin can trigger full re-index from settings
- Runs as background job
- Progress indicator in admin
- No downtime during re-indexing

---

## 5. Sponsored Search Results

Sponsored results are injected into search results based on:
1. Active campaigns targeting search results
2. Keyword matching against search query
3. Budget availability
4. Priority and bid amount
5. Frequency cap per user

Sponsored results are clearly marked with a "Sponsored" label.
