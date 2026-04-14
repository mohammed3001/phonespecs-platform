# Database Schema Design
# MobilePlatform

---

## 1. Entity Relationship Overview

```
Users ──┬── Roles ── Permissions
        ├── Reviews
        ├── Discussions
        └── AuditLogs

Brands ──┬── Phones ──┬── PhoneImages
         │            ├── PhoneSpecs ── SpecDefinitions ── SpecGroups
         │            ├── PhoneVariants
         │            ├── Reviews
         │            ├── Discussions
         │            └── Comparisons
         ├── Showrooms
         └── Companies ── CompanyUsers

Articles ──┬── Categories
           ├── Tags
           └── ArticlePhones

Campaigns ──┬── Advertisers
            ├── AdPlacements
            ├── AdImpressions
            └── AdClicks

Settings (key-value, JSON)
Media (centralized media library)
Menus ── MenuItems
Pages (CMS pages)
Redirects
SeoTemplates
```

---

## 2. Core Tables

### 2.1 Users & Auth

```sql
-- Users table
users
  id              UUID PRIMARY KEY
  email           VARCHAR(255) UNIQUE NOT NULL
  password_hash   VARCHAR(255) NOT NULL
  name            VARCHAR(255) NOT NULL
  avatar          VARCHAR(500)
  role_id         UUID REFERENCES roles(id)
  company_id      UUID REFERENCES companies(id) NULL
  is_active       BOOLEAN DEFAULT true
  email_verified  BOOLEAN DEFAULT false
  last_login_at   TIMESTAMP
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

-- Roles table
roles
  id              UUID PRIMARY KEY
  name            VARCHAR(100) UNIQUE NOT NULL
  slug            VARCHAR(100) UNIQUE NOT NULL
  description     TEXT
  is_system       BOOLEAN DEFAULT false
  created_at      TIMESTAMP DEFAULT NOW()

-- Permissions table
permissions
  id              UUID PRIMARY KEY
  name            VARCHAR(100) NOT NULL
  slug            VARCHAR(100) UNIQUE NOT NULL
  group           VARCHAR(100) NOT NULL
  description     TEXT

-- Role-Permission mapping
role_permissions
  role_id         UUID REFERENCES roles(id) ON DELETE CASCADE
  permission_id   UUID REFERENCES permissions(id) ON DELETE CASCADE
  PRIMARY KEY (role_id, permission_id)
```

### 2.2 Phones

```sql
-- Brands
brands
  id              UUID PRIMARY KEY
  name            VARCHAR(255) NOT NULL
  slug            VARCHAR(255) UNIQUE NOT NULL
  logo            VARCHAR(500)
  description     TEXT
  website         VARCHAR(500)
  is_active       BOOLEAN DEFAULT true
  phone_count     INTEGER DEFAULT 0
  sort_order      INTEGER DEFAULT 0
  meta_title      VARCHAR(255)
  meta_description TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

-- Phones
phones
  id              UUID PRIMARY KEY
  brand_id        UUID REFERENCES brands(id)
  name            VARCHAR(255) NOT NULL
  slug            VARCHAR(255) UNIQUE NOT NULL
  main_image      VARCHAR(500)
  market_status   ENUM('available','coming_soon','discontinued')
  release_date    DATE
  price_usd       DECIMAL(10,2)
  price_display   VARCHAR(100)
  overview        TEXT
  is_featured     BOOLEAN DEFAULT false
  is_published    BOOLEAN DEFAULT false
  view_count      INTEGER DEFAULT 0
  review_score    DECIMAL(3,1) DEFAULT 0
  review_count    INTEGER DEFAULT 0
  meta_title      VARCHAR(255)
  meta_description TEXT
  published_at    TIMESTAMP
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

-- Phone Images (gallery)
phone_images
  id              UUID PRIMARY KEY
  phone_id        UUID REFERENCES phones(id) ON DELETE CASCADE
  url             VARCHAR(500) NOT NULL
  alt_text        VARCHAR(255)
  sort_order      INTEGER DEFAULT 0
  created_at      TIMESTAMP DEFAULT NOW()

-- Phone Variants (storage/RAM combos)
phone_variants
  id              UUID PRIMARY KEY
  phone_id        UUID REFERENCES phones(id) ON DELETE CASCADE
  name            VARCHAR(255) NOT NULL  -- e.g. "8GB/128GB"
  storage         VARCHAR(50)
  ram             VARCHAR(50)
  price_usd       DECIMAL(10,2)
  is_default      BOOLEAN DEFAULT false
  sort_order      INTEGER DEFAULT 0
```

### 2.3 Specifications System (Dynamic)

```sql
-- Specification Groups (e.g., "Display", "Camera", "Battery")
spec_groups
  id              UUID PRIMARY KEY
  name            VARCHAR(255) NOT NULL
  slug            VARCHAR(255) UNIQUE NOT NULL
  sort_order      INTEGER DEFAULT 0
  icon            VARCHAR(100)  -- Iconify icon name
  created_at      TIMESTAMP DEFAULT NOW()

-- Specification Definitions (configurable from admin)
spec_definitions
  id              UUID PRIMARY KEY
  group_id        UUID REFERENCES spec_groups(id)
  name            VARCHAR(255) NOT NULL
  slug            VARCHAR(255) UNIQUE NOT NULL
  key             VARCHAR(100) UNIQUE NOT NULL  -- stable key for icon registry
  icon            VARCHAR(100)  -- Iconify icon name (from icon registry)
  unit            VARCHAR(50)   -- e.g., "mAh", "MP", "inches"
  data_type       ENUM('text','number','boolean','select') DEFAULT 'text'
  select_options  JSON          -- for select type: ["option1","option2"]
  show_in_card    BOOLEAN DEFAULT false   -- show in search result card
  show_in_detail  BOOLEAN DEFAULT true    -- show in product page
  show_in_compare BOOLEAN DEFAULT true    -- show in comparison
  is_filterable   BOOLEAN DEFAULT false   -- available as search filter
  is_highlighted  BOOLEAN DEFAULT false   -- show in key specs section
  sort_order      INTEGER DEFAULT 0
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

-- Phone Specification Values
phone_specs
  id              UUID PRIMARY KEY
  phone_id        UUID REFERENCES phones(id) ON DELETE CASCADE
  spec_id         UUID REFERENCES spec_definitions(id) ON DELETE CASCADE
  value           TEXT NOT NULL
  numeric_value   DECIMAL(15,4)  -- for filtering/sorting numeric specs
  UNIQUE(phone_id, spec_id)
```

### 2.4 Articles & Content

```sql
-- Categories (hierarchical)
categories
  id              UUID PRIMARY KEY
  parent_id       UUID REFERENCES categories(id) NULL
  name            VARCHAR(255) NOT NULL
  slug            VARCHAR(255) UNIQUE NOT NULL
  description     TEXT
  image           VARCHAR(500)
  sort_order      INTEGER DEFAULT 0
  meta_title      VARCHAR(255)
  meta_description TEXT
  created_at      TIMESTAMP DEFAULT NOW()

-- Tags
tags
  id              UUID PRIMARY KEY
  name            VARCHAR(255) NOT NULL
  slug            VARCHAR(255) UNIQUE NOT NULL
  created_at      TIMESTAMP DEFAULT NOW()

-- Articles
articles
  id              UUID PRIMARY KEY
  title           VARCHAR(500) NOT NULL
  slug            VARCHAR(500) UNIQUE NOT NULL
  excerpt         TEXT
  content         JSON NOT NULL  -- block editor content
  featured_image  VARCHAR(500)
  type            ENUM('news','review','guide','comparison') DEFAULT 'news'
  status          ENUM('draft','published','scheduled','archived') DEFAULT 'draft'
  author_id       UUID REFERENCES users(id)
  category_id     UUID REFERENCES categories(id)
  view_count      INTEGER DEFAULT 0
  is_featured     BOOLEAN DEFAULT false
  meta_title      VARCHAR(255)
  meta_description TEXT
  scheduled_at    TIMESTAMP
  published_at    TIMESTAMP
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

-- Article Tags
article_tags
  article_id      UUID REFERENCES articles(id) ON DELETE CASCADE
  tag_id          UUID REFERENCES tags(id) ON DELETE CASCADE
  PRIMARY KEY (article_id, tag_id)

-- Article-Phone relations
article_phones
  article_id      UUID REFERENCES articles(id) ON DELETE CASCADE
  phone_id        UUID REFERENCES phones(id) ON DELETE CASCADE
  PRIMARY KEY (article_id, phone_id)

-- Article Revisions
article_revisions
  id              UUID PRIMARY KEY
  article_id      UUID REFERENCES articles(id) ON DELETE CASCADE
  title           VARCHAR(500) NOT NULL
  content         JSON NOT NULL
  author_id       UUID REFERENCES users(id)
  revision_note   VARCHAR(255)
  created_at      TIMESTAMP DEFAULT NOW()
```

### 2.5 Reviews & Ratings

```sql
-- Review Rating Categories (configurable)
rating_categories
  id              UUID PRIMARY KEY
  name            VARCHAR(255) NOT NULL  -- e.g., "Camera", "Battery Life"
  slug            VARCHAR(255) UNIQUE NOT NULL
  icon            VARCHAR(100)
  weight          DECIMAL(3,2) DEFAULT 1.0  -- for weighted average
  sort_order      INTEGER DEFAULT 0
  is_active       BOOLEAN DEFAULT true

-- Reviews
reviews
  id              UUID PRIMARY KEY
  phone_id        UUID REFERENCES phones(id) ON DELETE CASCADE
  user_id         UUID REFERENCES users(id)
  type            ENUM('expert','user') DEFAULT 'user'
  title           VARCHAR(255)
  content         TEXT
  overall_score   DECIMAL(3,1)
  pros            JSON  -- ["pro1", "pro2"]
  cons            JSON  -- ["con1", "con2"]
  is_verified     BOOLEAN DEFAULT false
  is_approved     BOOLEAN DEFAULT false
  helpful_count   INTEGER DEFAULT 0
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

-- Review Ratings (per category)
review_ratings
  id              UUID PRIMARY KEY
  review_id       UUID REFERENCES reviews(id) ON DELETE CASCADE
  category_id     UUID REFERENCES rating_categories(id)
  score           DECIMAL(3,1) NOT NULL  -- 1.0 to 10.0
  UNIQUE(review_id, category_id)

-- Review Responses (from companies)
review_responses
  id              UUID PRIMARY KEY
  review_id       UUID REFERENCES reviews(id) ON DELETE CASCADE
  company_id      UUID REFERENCES companies(id)
  user_id         UUID REFERENCES users(id)
  content         TEXT NOT NULL
  created_at      TIMESTAMP DEFAULT NOW()
```

### 2.6 Comparisons

```sql
-- Saved Comparisons
comparisons
  id              UUID PRIMARY KEY
  title           VARCHAR(255)
  slug            VARCHAR(255) UNIQUE NOT NULL
  description     TEXT
  is_featured     BOOLEAN DEFAULT false
  is_published    BOOLEAN DEFAULT true
  view_count      INTEGER DEFAULT 0
  meta_title      VARCHAR(255)
  meta_description TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

-- Comparison Phones (up to 4)
comparison_phones
  comparison_id   UUID REFERENCES comparisons(id) ON DELETE CASCADE
  phone_id        UUID REFERENCES phones(id) ON DELETE CASCADE
  sort_order      INTEGER DEFAULT 0
  PRIMARY KEY (comparison_id, phone_id)
```

### 2.7 Discussions

```sql
-- Discussion Threads
discussions
  id              UUID PRIMARY KEY
  phone_id        UUID REFERENCES phones(id) NULL
  category        VARCHAR(100) DEFAULT 'general'
  title           VARCHAR(500) NOT NULL
  content         TEXT NOT NULL
  user_id         UUID REFERENCES users(id)
  is_pinned       BOOLEAN DEFAULT false
  is_locked       BOOLEAN DEFAULT false
  reply_count     INTEGER DEFAULT 0
  upvote_count    INTEGER DEFAULT 0
  view_count      INTEGER DEFAULT 0
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

-- Discussion Replies
discussion_replies
  id              UUID PRIMARY KEY
  discussion_id   UUID REFERENCES discussions(id) ON DELETE CASCADE
  user_id         UUID REFERENCES users(id)
  content         TEXT NOT NULL
  upvote_count    INTEGER DEFAULT 0
  is_company_reply BOOLEAN DEFAULT false
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

-- Upvotes
discussion_upvotes
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE
  target_type     ENUM('discussion','reply')
  target_id       UUID NOT NULL
  created_at      TIMESTAMP DEFAULT NOW()
  PRIMARY KEY (user_id, target_type, target_id)
```

### 2.8 Showrooms

```sql
showrooms
  id              UUID PRIMARY KEY
  company_id      UUID REFERENCES companies(id) NULL
  brand_id        UUID REFERENCES brands(id) NULL
  name            VARCHAR(255) NOT NULL
  slug            VARCHAR(255) UNIQUE NOT NULL
  description     TEXT
  address         TEXT
  city            VARCHAR(255)
  country         VARCHAR(100)
  latitude        DECIMAL(10,8)
  longitude       DECIMAL(11,8)
  phone_number    VARCHAR(50)
  email           VARCHAR(255)
  website         VARCHAR(500)
  images          JSON  -- array of image URLs
  working_hours   JSON  -- structured hours data
  is_active       BOOLEAN DEFAULT true
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()
```

### 2.9 Companies & Advertisers

```sql
-- Companies (brands/retailers)
companies
  id              UUID PRIMARY KEY
  name            VARCHAR(255) NOT NULL
  slug            VARCHAR(255) UNIQUE NOT NULL
  logo            VARCHAR(500)
  description     TEXT
  website         VARCHAR(500)
  type            ENUM('brand','retailer','advertiser') DEFAULT 'brand'
  is_verified     BOOLEAN DEFAULT false
  is_active       BOOLEAN DEFAULT true
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

-- Company Users
company_users
  company_id      UUID REFERENCES companies(id) ON DELETE CASCADE
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE
  role            ENUM('admin','member') DEFAULT 'member'
  PRIMARY KEY (company_id, user_id)

-- Advertisers
advertisers
  id              UUID PRIMARY KEY
  company_id      UUID REFERENCES companies(id) NULL
  name            VARCHAR(255) NOT NULL
  email           VARCHAR(255)
  contact_person  VARCHAR(255)
  balance         DECIMAL(12,2) DEFAULT 0
  is_active       BOOLEAN DEFAULT true
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()
```

### 2.10 Advertising System

```sql
-- Ad Campaigns
campaigns
  id              UUID PRIMARY KEY
  advertiser_id   UUID REFERENCES advertisers(id)
  name            VARCHAR(255) NOT NULL
  type            ENUM('sponsored_product','banner','native','brand_placement') 
  pricing_model   ENUM('cpm','cpc','flat') DEFAULT 'cpm'
  status          ENUM('draft','active','paused','completed','archived') DEFAULT 'draft'
  budget_total    DECIMAL(12,2)
  budget_daily    DECIMAL(12,2)
  spent_total     DECIMAL(12,2) DEFAULT 0
  bid_amount      DECIMAL(8,4)  -- CPM/CPC bid
  start_date      DATE
  end_date        DATE
  priority        INTEGER DEFAULT 0
  frequency_cap   INTEGER  -- max impressions per user per day
  targeting       JSON  -- targeting rules
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

-- Ad Creatives
ad_creatives
  id              UUID PRIMARY KEY
  campaign_id     UUID REFERENCES campaigns(id) ON DELETE CASCADE
  title           VARCHAR(255)
  description     TEXT
  image           VARCHAR(500)
  click_url       VARCHAR(1000)
  phone_id        UUID REFERENCES phones(id) NULL  -- for sponsored products
  is_active       BOOLEAN DEFAULT true
  created_at      TIMESTAMP DEFAULT NOW()

-- Ad Slots (template zones)
ad_slots
  id              UUID PRIMARY KEY
  name            VARCHAR(255) NOT NULL
  slug            VARCHAR(255) UNIQUE NOT NULL
  page_type       VARCHAR(100) NOT NULL  -- 'home','search','phone_detail','article'
  position        VARCHAR(100) NOT NULL  -- 'sidebar','in_content','header','footer'
  dimensions      VARCHAR(50)  -- '300x250', '728x90', etc.
  is_active       BOOLEAN DEFAULT true
  fallback_html   TEXT  -- shown when no campaign matches
  sort_order      INTEGER DEFAULT 0
  created_at      TIMESTAMP DEFAULT NOW()

-- Ad Impressions
ad_impressions
  id              BIGSERIAL PRIMARY KEY
  campaign_id     UUID REFERENCES campaigns(id)
  creative_id     UUID REFERENCES ad_creatives(id)
  slot_id         UUID REFERENCES ad_slots(id)
  user_fingerprint VARCHAR(64)
  ip_address      VARCHAR(45)
  country         VARCHAR(2)
  device_type     VARCHAR(20)
  page_url        VARCHAR(1000)
  created_at      TIMESTAMP DEFAULT NOW()

-- Ad Clicks
ad_clicks
  id              BIGSERIAL PRIMARY KEY
  campaign_id     UUID REFERENCES campaigns(id)
  creative_id     UUID REFERENCES ad_creatives(id)
  slot_id         UUID REFERENCES ad_slots(id)
  user_fingerprint VARCHAR(64)
  ip_address      VARCHAR(45)
  country         VARCHAR(2)
  device_type     VARCHAR(20)
  page_url        VARCHAR(1000)
  click_url       VARCHAR(1000)
  created_at      TIMESTAMP DEFAULT NOW()

-- Daily Ad Stats (aggregated)
ad_daily_stats
  id              UUID PRIMARY KEY
  campaign_id     UUID REFERENCES campaigns(id)
  creative_id     UUID REFERENCES ad_creatives(id)
  date            DATE NOT NULL
  impressions     INTEGER DEFAULT 0
  clicks          INTEGER DEFAULT 0
  spent           DECIMAL(12,4) DEFAULT 0
  UNIQUE(campaign_id, creative_id, date)
```

### 2.11 CMS & Settings

```sql
-- Settings (key-value store)
settings
  id              UUID PRIMARY KEY
  key             VARCHAR(255) UNIQUE NOT NULL
  value           JSON NOT NULL
  group           VARCHAR(100) DEFAULT 'general'
  is_public       BOOLEAN DEFAULT false
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

-- Pages (CMS)
pages
  id              UUID PRIMARY KEY
  title           VARCHAR(255) NOT NULL
  slug            VARCHAR(255) UNIQUE NOT NULL
  content         JSON  -- block editor content
  template        VARCHAR(100) DEFAULT 'default'
  status          ENUM('draft','published') DEFAULT 'draft'
  meta_title      VARCHAR(255)
  meta_description TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

-- Menus
menus
  id              UUID PRIMARY KEY
  name            VARCHAR(255) NOT NULL
  slug            VARCHAR(255) UNIQUE NOT NULL
  location        VARCHAR(100)  -- 'header','footer','sidebar'
  created_at      TIMESTAMP DEFAULT NOW()

-- Menu Items
menu_items
  id              UUID PRIMARY KEY
  menu_id         UUID REFERENCES menus(id) ON DELETE CASCADE
  parent_id       UUID REFERENCES menu_items(id) NULL
  title           VARCHAR(255) NOT NULL
  url             VARCHAR(500)
  target          VARCHAR(20) DEFAULT '_self'
  icon            VARCHAR(100)
  sort_order      INTEGER DEFAULT 0

-- Media Library
media
  id              UUID PRIMARY KEY
  filename        VARCHAR(255) NOT NULL
  original_name   VARCHAR(255) NOT NULL
  mime_type       VARCHAR(100) NOT NULL
  size            INTEGER NOT NULL  -- bytes
  path            VARCHAR(500) NOT NULL
  thumbnail_path  VARCHAR(500)
  alt_text        VARCHAR(255)
  folder          VARCHAR(255) DEFAULT '/'
  dimensions      JSON  -- {width, height}
  variants        JSON  -- {small: url, medium: url, large: url}
  uploaded_by     UUID REFERENCES users(id)
  created_at      TIMESTAMP DEFAULT NOW()

-- SEO Templates
seo_templates
  id              UUID PRIMARY KEY
  content_type    VARCHAR(100) UNIQUE NOT NULL  -- 'phone','article','brand','category'
  title_template  VARCHAR(500)  -- "{{phone.name}} Specs & Price - {{site.name}}"
  description_template TEXT     -- "Full specifications of {{phone.name}}..."
  og_title_template VARCHAR(500)
  og_description_template TEXT
  robots          VARCHAR(100) DEFAULT 'index,follow'
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

-- Redirects
redirects
  id              UUID PRIMARY KEY
  source_path     VARCHAR(500) NOT NULL
  target_path     VARCHAR(500) NOT NULL
  type            INTEGER DEFAULT 301  -- 301 or 302
  is_active       BOOLEAN DEFAULT true
  hit_count       INTEGER DEFAULT 0
  created_at      TIMESTAMP DEFAULT NOW()

-- Audit Log
audit_logs
  id              BIGSERIAL PRIMARY KEY
  user_id         UUID REFERENCES users(id) NULL
  action          VARCHAR(100) NOT NULL  -- 'create','update','delete','login'
  entity_type     VARCHAR(100) NOT NULL  -- 'phone','article','campaign'
  entity_id       VARCHAR(255)
  changes         JSON  -- {field: {old: x, new: y}}
  ip_address      VARCHAR(45)
  user_agent      TEXT
  created_at      TIMESTAMP DEFAULT NOW()

-- FAQ
faqs
  id              UUID PRIMARY KEY
  phone_id        UUID REFERENCES phones(id) NULL
  question        TEXT NOT NULL
  answer          TEXT NOT NULL
  sort_order      INTEGER DEFAULT 0
  is_active       BOOLEAN DEFAULT true
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

-- Payments
payments
  id              UUID PRIMARY KEY
  advertiser_id   UUID REFERENCES advertisers(id)
  amount          DECIMAL(12,2) NOT NULL
  currency        VARCHAR(3) DEFAULT 'USD'
  provider        VARCHAR(50) NOT NULL  -- 'stripe','paypal',etc
  provider_ref    VARCHAR(255)  -- external payment reference
  status          ENUM('pending','completed','failed','refunded') DEFAULT 'pending'
  metadata        JSON
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()
```

---

## 3. Indexes

Key indexes for performance:
```sql
-- Phone lookups
CREATE INDEX idx_phones_brand ON phones(brand_id);
CREATE INDEX idx_phones_slug ON phones(slug);
CREATE INDEX idx_phones_status ON phones(market_status);
CREATE INDEX idx_phones_published ON phones(is_published, published_at DESC);

-- Spec lookups
CREATE INDEX idx_phone_specs_phone ON phone_specs(phone_id);
CREATE INDEX idx_phone_specs_spec ON phone_specs(spec_id);
CREATE INDEX idx_phone_specs_numeric ON phone_specs(spec_id, numeric_value);

-- Article lookups
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status, published_at DESC);
CREATE INDEX idx_articles_type ON articles(type);
CREATE INDEX idx_articles_category ON articles(category_id);

-- Ad lookups
CREATE INDEX idx_campaigns_status ON campaigns(status, start_date, end_date);
CREATE INDEX idx_ad_impressions_campaign ON ad_impressions(campaign_id, created_at);
CREATE INDEX idx_ad_clicks_campaign ON ad_clicks(campaign_id, created_at);
CREATE INDEX idx_ad_daily_stats_date ON ad_daily_stats(campaign_id, date);

-- Audit log
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);

-- Search
CREATE INDEX idx_phones_search ON phones USING gin(to_tsvector('english', name));
```
