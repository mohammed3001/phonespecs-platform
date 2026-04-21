# Admin Panel Information Architecture
# MobilePlatform

---

## 1. Navigation Structure

```
Admin Panel (/admin)
│
├── 📊 Dashboard
│   ├── Key Metrics (phones, articles, users, revenue)
│   ├── Recent Activity Feed
│   ├── Popular Phones Chart
│   ├── Traffic Overview
│   ├── Ad Revenue Summary
│   └── Error Log Widget
│
├── 📱 Phones
│   ├── All Phones (list with filters, search, bulk actions)
│   ├── Add New Phone
│   ├── Edit Phone
│   │   ├── Basic Info (name, brand, status, price, overview)
│   │   ├── Images (main + gallery with drag-drop)
│   │   ├── Specifications (dynamic form based on spec definitions)
│   │   ├── Variants (storage/RAM combos)
│   │   ├── SEO (meta title, description, canonical)
│   │   ├── Related Phones
│   │   └── FAQs
│   └── Specification System
│       ├── Spec Groups (manage groups: Display, Camera, etc.)
│       ├── Spec Definitions (manage individual specs)
│       └── Icon Registry (assign Iconify icons to specs)
│
├── 🏢 Brands
│   ├── All Brands
│   ├── Add/Edit Brand
│   └── Brand Analytics
│
├── 📝 Articles
│   ├── All Articles (filter by type, status, author)
│   ├── New Article (block editor)
│   │   ├── Content Editor (TipTap block editor)
│   │   ├── Article Settings (type, category, tags)
│   │   ├── Featured Image
│   │   ├── Related Phones
│   │   ├── SEO Settings
│   │   ├── Scheduling
│   │   └── Revision History
│   ├── Categories (hierarchical management)
│   └── Tags
│
├── 📁 Categories
│   ├── All Categories (tree view)
│   ├── Add/Edit Category
│   └── Reorder Categories
│
├── 🏷️ Tags
│   ├── All Tags
│   ├── Add/Edit Tag
│   └── Merge Tags
│
├── 🖼️ Media Library
│   ├── Grid/List View
│   ├── Upload (drag-drop, multi-file)
│   ├── Folders
│   ├── Image Details & Edit
│   └── Bulk Actions
│
├── 👥 Users
│   ├── All Users
│   ├── Add/Edit User
│   ├── User Activity Log
│   └── Bulk Actions
│
├── 🏭 Companies
│   ├── All Companies
│   ├── Add/Edit Company
│   ├── Company Users
│   ├── Verification Status
│   └── Company Activity
│
├── 📢 Advertising
│   ├── Advertisers
│   │   ├── All Advertisers
│   │   ├── Add/Edit Advertiser
│   │   └── Balance Management
│   ├── Campaigns
│   │   ├── All Campaigns (filter by status, advertiser)
│   │   ├── Create Campaign
│   │   │   ├── Campaign Details (name, type, dates)
│   │   │   ├── Creatives (images, text, links)
│   │   │   ├── Targeting (page, brand, category, geo, device)
│   │   │   ├── Budget & Bidding (model, amount, daily cap)
│   │   │   ├── Frequency Caps
│   │   │   └── Priority Settings
│   │   └── Campaign Analytics
│   ├── Ad Slots
│   │   ├── All Slots
│   │   ├── Add/Edit Slot (page type, position, dimensions)
│   │   └── Slot Inventory
│   └── Ad Reports
│       ├── Revenue Overview
│       ├── Campaign Performance
│       ├── Slot Performance
│       └── Export Reports
│
├── 🏠 Homepage
│   ├── Hero Section Settings
│   ├── Featured Phones
│   ├── Featured Articles
│   ├── Section Order & Visibility
│   └── Banner Management
│
├── ⚙️ Website Setup
│   ├── General (site name, tagline, logo, favicon)
│   ├── Contact Information
│   ├── Social Media Links
│   ├── Analytics (Google Analytics ID, etc.)
│   └── Third-party Integrations
│
├── 🎨 Appearance
│   ├── Theme Colors
│   ├── Typography
│   ├── Layout Options
│   └── Custom CSS
│
├── 📋 Menus
│   ├── Header Menu
│   ├── Footer Menu
│   ├── Mobile Menu
│   └── Menu Item Editor (drag-drop tree builder)
│
├── 📄 Pages
│   ├── All Pages
│   ├── Add/Edit Page (block editor)
│   └── Page Templates
│
├── 🔍 SEO Settings
│   ├── Meta Templates (per content type)
│   ├── Sitemap Settings
│   ├── Robots.txt Editor
│   ├── Redirects Manager
│   ├── Structured Data Settings
│   ├── Canonical URL Rules
│   └── Programmatic SEO Pages
│
├── 🔎 Search Settings
│   ├── Search Configuration
│   ├── Synonym Rules
│   ├── Query Rewrite Rules
│   ├── Search Analytics
│   ├── Landing Pages
│   └── Re-index Trigger
│
├── 📧 Email Settings
│   ├── SMTP Configuration
│   ├── Email Templates
│   └── Email Log
│
├── ⚡ Caching & Performance
│   ├── Cache Status
│   ├── Clear Cache (selective)
│   ├── Queue Status
│   ├── Background Jobs Monitor
│   └── Performance Metrics
│
├── 🐛 Error Monitoring
│   ├── Recent Errors
│   ├── Error Details
│   ├── Error Statistics
│   └── Resolved/Unresolved Filter
│
├── 🔌 Integrations
│   ├── Payment Gateways
│   ├── Email Providers
│   ├── Analytics Services
│   └── API Keys Management
│
├── 🔐 Roles & Permissions
│   ├── All Roles
│   ├── Add/Edit Role
│   ├── Permission Matrix
│   └── User-Role Assignment
│
└── 📜 Audit Log
    ├── Activity Stream
    ├── Filter by User/Action/Entity
    ├── Export Log
    └── Retention Settings
```

---

## 2. Admin UI Patterns

### 2.1 List Pages
Every list page follows a consistent pattern:
- **Search bar** at top
- **Filter dropdowns** (status, type, date range, etc.)
- **Sortable columns** with click-to-sort
- **Bulk actions** (delete, publish, unpublish, export)
- **Pagination** with per-page count selector
- **Quick actions** per row (edit, delete, duplicate, preview)

### 2.2 Form Pages
Every edit/create form follows:
- **Tabbed interface** for complex entities (phone, article)
- **Auto-save draft** functionality
- **Validation** with inline error messages
- **Save/Publish** split button
- **Preview** button for content pages
- **Delete** with confirmation modal

### 2.3 Dashboard Widgets
- **Metric Cards**: Large number + trend indicator + sparkline
- **Charts**: Line charts (traffic), bar charts (top phones), pie charts (device types)
- **Activity Feed**: Chronological list of recent actions
- **Quick Actions**: Common tasks one-click away

---

## 3. Responsive Admin

The admin panel is responsive:
- **Desktop**: Full sidebar + content area
- **Tablet**: Collapsible sidebar + full content
- **Mobile**: Bottom navigation + stacked content (limited admin on mobile)
