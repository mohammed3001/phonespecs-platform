# SEO Architecture
# MobilePlatform

---

## 1. SEO Strategy Overview

The platform implements **automatic, template-driven SEO** that requires zero code changes when adding new content. Every SEO element is configurable from the admin panel.

---

## 2. Meta Tag System

### 2.1 Dynamic Templates
Each content type has configurable meta templates with variables:

| Content Type | Default Title Template | Default Description Template |
|---|---|---|
| Phone | `{{phone.name}} Specs, Price & Review - {{site.name}}` | `Full specifications, price, and review of {{phone.name}} by {{phone.brand}}. {{phone.key_specs_summary}}` |
| Brand | `{{brand.name}} Phones - All Models & Specs - {{site.name}}` | `Browse all {{brand.name}} phones with full specs, prices, and reviews on {{site.name}}.` |
| Article | `{{article.title}} - {{site.name}}` | `{{article.excerpt}}` |
| Category | `{{category.name}} - {{site.name}}` | `Browse phones in {{category.name}} category.` |
| Comparison | `{{phone1.name}} vs {{phone2.name}} - Comparison - {{site.name}}` | `Compare {{phone1.name}} and {{phone2.name}} specifications side by side.` |
| Collection | `Best {{filter.label}} Phones {{year}} - {{site.name}}` | `Top phones with {{filter.label}} in {{year}}. Compare specs and prices.` |

### 2.2 Per-Page Override
Every page can override its auto-generated meta:
- Custom meta title
- Custom meta description
- Custom canonical URL
- Custom robots directive

---

## 3. Structured Data (JSON-LD)

### 3.1 Phone Pages
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Samsung Galaxy S24 Ultra",
  "image": "https://example.com/images/s24-ultra.jpg",
  "brand": {
    "@type": "Brand",
    "name": "Samsung"
  },
  "offers": {
    "@type": "Offer",
    "price": "1299.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "9.2",
    "bestRating": "10",
    "ratingCount": "245"
  },
  "review": [{
    "@type": "Review",
    "author": {"@type": "Person", "name": "Expert"},
    "reviewRating": {"@type": "Rating", "ratingValue": "9.2"}
  }]
}
```

### 3.2 Article Pages
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "image": "featured-image-url",
  "datePublished": "2024-01-15",
  "dateModified": "2024-01-16",
  "author": {"@type": "Person", "name": "Author Name"},
  "publisher": {
    "@type": "Organization",
    "name": "Site Name",
    "logo": {"@type": "ImageObject", "url": "logo-url"}
  }
}
```

### 3.3 FAQ Structured Data
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What is the battery capacity?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "5000 mAh with 45W fast charging"
    }
  }]
}
```

### 3.4 Breadcrumb Structured Data
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "/"},
    {"@type": "ListItem", "position": 2, "name": "Samsung", "item": "/brands/samsung"},
    {"@type": "ListItem", "position": 3, "name": "Galaxy S24 Ultra"}
  ]
}
```

---

## 4. Open Graph & Twitter Cards

Auto-generated for every page:
```html
<!-- Open Graph -->
<meta property="og:title" content="Phone Name - Site Name" />
<meta property="og:description" content="Description..." />
<meta property="og:image" content="https://example.com/phone-image.jpg" />
<meta property="og:url" content="https://example.com/phones/phone-slug" />
<meta property="og:type" content="product" />
<meta property="og:site_name" content="Site Name" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Phone Name - Site Name" />
<meta name="twitter:description" content="Description..." />
<meta name="twitter:image" content="https://example.com/phone-image.jpg" />
```

---

## 5. Sitemap System

### Auto-Generated Sitemaps
```
/sitemap.xml (index)
├── /sitemap-phones.xml      (all published phones)
├── /sitemap-brands.xml      (all active brands)
├── /sitemap-articles.xml    (all published articles)
├── /sitemap-comparisons.xml (popular comparisons)
├── /sitemap-categories.xml  (all categories)
├── /sitemap-collections.xml (programmatic SEO pages)
└── /sitemap-pages.xml       (CMS pages)
```

- Regenerated via background job on content changes
- Includes `<lastmod>`, `<changefreq>`, `<priority>`
- Submitted to search engines via `robots.txt`

---

## 6. Robots.txt

Configurable from admin:
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /company/
Disallow: /api/
Sitemap: https://example.com/sitemap.xml
```

---

## 7. Canonical URLs

Automatic canonical URL generation:
- Self-referencing canonicals on every page
- Handles pagination (canonical to page 1)
- Handles query parameters (canonical without filters)
- Admin can override per page

---

## 8. Redirects Manager

Admin-managed redirect rules:
- 301 (permanent) and 302 (temporary)
- Bulk import via CSV
- Hit counter per redirect
- Wildcard patterns support
- Automatic redirect on slug change

---

## 9. Internal Linking Engine

Automated internal linking:
- Related phones section (by brand, specs similarity)
- Related articles section
- "By Brand" section on phone pages
- Breadcrumb navigation
- Category/tag archive pages
- Latest news/comparisons widgets

---

## 10. Programmatic SEO Pages

Auto-generated collection pages for common search patterns:

### URL Patterns
```
/phones/brand/{brand}                    → Samsung Phones
/phones/battery/{range}                  → Phones with 5000mAh+ Battery
/phones/display/{type}                   → AMOLED Display Phones
/phones/ram/{size}                       → 8GB RAM Phones
/phones/storage/{size}                   → 256GB Storage Phones
/phones/charging/{speed}                 → 65W Fast Charging Phones
/phones/ip-rating/{rating}              → IP68 Water Resistant Phones
/phones/price/{range}                    → Phones Under $500
/phones/year/{year}                      → Phones Released in 2024
```

### Features
- Auto-generated from spec definitions marked for programmatic SEO
- Configurable from admin (which specs generate pages)
- Custom content blocks per collection page
- Unique meta titles and descriptions via templates
- Internal linking between related collections

---

## 11. Performance SEO

- **Core Web Vitals** optimized (LCP, FID, CLS)
- **Image optimization** (WebP/AVIF, lazy loading, responsive sizes)
- **Server-side rendering** for all public pages
- **Static generation** where possible (ISR)
- **Preloading** critical resources
- **Minification** of CSS/JS
