# Ads Engine Architecture
# MobilePlatform

---

## 1. Overview

The advertising engine is a **fully internal, self-serve ad system** — not dependent on third-party ad networks. It supports multiple ad formats, pricing models, targeting options, and provides real-time reporting.

---

## 2. Ad Types & Placements

### 2.1 Sponsored Products
- Appear in search results with "Sponsored" label
- Linked to specific phone entries
- Triggered by keyword/category matching
- Position: Top of search results (1-2 slots)

### 2.2 Banner Ads
- Display ads with images
- Positions: Sidebar, header, footer, in-content
- Multiple sizes: 300x250, 728x90, 160x600, 320x50 (mobile)
- Responsive variants

### 2.3 Native Ads
- Blend with content flow
- "Sponsored" phone cards in listings
- "Sponsored" articles in news feed
- Brand spotlight sections

### 2.4 Brand Placements
- Homepage brand spotlight
- Brand page enhancement
- Comparison page sponsorship
- Category page sponsorship

---

## 3. Campaign Lifecycle

```
Draft → Under Review → Active → Running
                                   │
                        ┌──────────┼──────────┐
                        ▼          ▼          ▼
                     Paused    Completed   Budget
                        │                 Depleted
                        ▼                    │
                     Active ◄────────────────┘
                        │                (auto-pause)
                        ▼
                    Archived
```

### States
- **Draft**: Created but not submitted
- **Under Review**: Submitted for admin approval (if required)
- **Active**: Approved and within date range
- **Running**: Currently serving impressions
- **Paused**: Manually paused by advertiser
- **Completed**: End date reached
- **Budget Depleted**: Daily or total budget exhausted
- **Archived**: Old campaign, read-only

---

## 4. Pricing Models

### 4.1 CPM (Cost Per Mille)
- Charged per 1,000 impressions
- Best for brand awareness
- Minimum bid configurable by admin

### 4.2 CPC (Cost Per Click)
- Charged per click
- Best for traffic driving
- Click fraud protection (duplicate detection, bot filtering)

### 4.3 Flat Rate
- Fixed price for a time period
- Best for premium placements
- Guaranteed visibility

---

## 5. Targeting System

```json
{
  "targeting": {
    "page_types": ["search", "phone_detail", "comparison"],
    "brands": ["samsung", "apple"],
    "categories": ["flagship", "mid-range"],
    "keywords": ["best camera", "5G phone"],
    "countries": ["US", "UK", "SA"],
    "devices": ["mobile", "desktop", "tablet"],
    "operating_systems": ["android", "ios"],
    "exclude_brands": ["competitor_brand"],
    "time_of_day": {"start": "08:00", "end": "22:00"},
    "days_of_week": ["mon", "tue", "wed", "thu", "fri"]
  }
}
```

---

## 6. Ad Serving Algorithm

```
Request comes in for page type + context
    │
    ▼
Find active campaigns targeting this page type
    │
    ▼
Filter by targeting rules (brand, category, geo, device)
    │
    ▼
Filter by budget (daily limit not exceeded)
    │
    ▼
Filter by frequency cap (user hasn't seen too many)
    │
    ▼
Sort by: priority → bid amount → campaign freshness
    │
    ▼
Select top N campaigns for available slots
    │
    ▼
Record impression
    │
    ▼
Return ad creative data
```

---

## 7. Auto Ad Slots System

### Template-Based Zones
Every page template defines ad zones:

```typescript
// Page template defines available zones
const phoneDetailTemplate = {
  zones: [
    { slug: 'phone-detail-sidebar-top', position: 'sidebar', type: 'banner' },
    { slug: 'phone-detail-sidebar-bottom', position: 'sidebar', type: 'banner' },
    { slug: 'phone-detail-after-specs', position: 'in_content', type: 'native' },
    { slug: 'phone-detail-before-reviews', position: 'in_content', type: 'banner' },
    { slug: 'phone-detail-related-sponsored', position: 'related', type: 'sponsored_product' },
  ]
};
```

### Dynamic Resolution
When a new page type is created:
1. Admin defines zones in the page template settings
2. Ad resolver automatically maps campaigns to new zones
3. No code changes needed

### Fallback Logic
```
Campaign matched? → Show campaign creative
No campaign? → Show fallback ad (house ad)
No fallback? → Show empty state (collapse zone)
```

---

## 8. Tracking & Analytics

### 8.1 Impression Tracking
- Server-side impression recording
- Deduplicated per session
- Country/device detection
- Page context captured

### 8.2 Click Tracking
- Click-through redirect with tracking
- Bot/fraud detection
- Unique click counting
- Landing page verification

### 8.3 Real-Time Aggregation
```
Raw Events → Queue → Aggregation Worker → Daily Stats Table
                                              │
                                              ▼
                                    Reporting Dashboard
```

### 8.4 Reporting Metrics
| Metric | Description |
|--------|-------------|
| Impressions | Total ad views |
| Clicks | Total ad clicks |
| CTR | Click-through rate |
| Spend | Total amount spent |
| eCPM | Effective CPM |
| eCPC | Effective CPC |
| Fill Rate | % of ad requests served |
| Frequency | Avg impressions per user |

---

## 9. Budget Management

### Daily Budget
- Track spend per day per campaign
- Auto-pause when daily limit reached
- Resume next day automatically

### Total Budget
- Track cumulative spend
- Auto-complete campaign when total budget exhausted
- Warning notifications at 80% and 95%

### Advertiser Balance
- Pre-paid balance system
- Auto-deduct based on impressions/clicks
- Low balance alerts
- Payment integration for top-up

---

## 10. Ad Inventory Management

### Inventory Report
Admin dashboard showing:
- Available ad slots per page type
- Fill rates per slot
- Revenue per slot
- Unsold inventory
- Recommended pricing

### Slot Performance
- Which slots generate most clicks
- Which slots have best CTR
- Revenue optimization suggestions
