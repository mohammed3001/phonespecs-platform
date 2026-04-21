# Brand/Advertiser Portal Architecture
# MobilePlatform

---

## 1. Portal Navigation Structure

```
Company Portal (/company)
│
├── 📊 Dashboard
│   ├── Account Overview
│   ├── Active Campaigns Summary
│   ├── Recent Performance Metrics
│   ├── Pending Actions (reviews to respond, suggestions to make)
│   └── Notifications
│
├── 👤 Account
│   ├── Company Profile (name, logo, description, website)
│   ├── Team Members (invite, manage roles)
│   ├── Billing Information
│   ├── Payment Methods
│   └── Account Settings
│
├── 📢 Campaigns
│   ├── All Campaigns (with status filters)
│   ├── Create New Campaign
│   │   ├── Step 1: Campaign Type Selection
│   │   │   - Sponsored Product (in search results)
│   │   │   - Banner Ad (sidebar, in-content)
│   │   │   - Brand Placement (homepage, brand pages)
│   │   │   - Comparison Sponsorship
│   │   ├── Step 2: Creative Setup
│   │   │   - Upload images
│   │   │   - Write ad copy
│   │   │   - Set click-through URL
│   │   │   - Select phones (for sponsored products)
│   │   ├── Step 3: Targeting
│   │   │   - Page types
│   │   │   - Categories
│   │   │   - Keywords
│   │   │   - Countries
│   │   │   - Device types
│   │   ├── Step 4: Budget & Schedule
│   │   │   - Pricing model (CPM/CPC/Flat)
│   │   │   - Total budget
│   │   │   - Daily budget cap
│   │   │   - Start/end dates
│   │   │   - Frequency cap
│   │   └── Step 5: Review & Launch
│   ├── Campaign Details
│   │   ├── Performance Chart (impressions, clicks, CTR)
│   │   ├── Daily Breakdown
│   │   ├── Budget Usage
│   │   └── Pause/Resume/Edit Controls
│   └── Campaign Templates (save & reuse)
│
├── 🖼️ Materials
│   ├── Brand Assets (logos, images, videos)
│   ├── Upload New Materials
│   ├── Asset Library (organized by campaign/type)
│   └── Creative Guidelines
│
├── 🏪 Showrooms
│   ├── All Showrooms
│   ├── Add New Showroom
│   │   - Name & Description
│   │   - Address & Location (map picker)
│   │   - Contact Information
│   │   - Working Hours
│   │   - Photos
│   └── Edit/Deactivate Showroom
│
├── 📊 Reports
│   ├── Campaign Performance
│   │   - Impressions & Clicks Over Time
│   │   - CTR Analysis
│   │   - Cost Analysis
│   │   - Conversion Tracking
│   ├── Brand Analytics
│   │   - Phone Page Views
│   │   - Search Appearances
│   │   - Review Sentiment
│   │   - Comparison Frequency
│   ├── Showroom Analytics
│   │   - Page Views
│   │   - Direction Requests
│   │   - Contact Clicks
│   └── Export Reports (CSV, PDF)
│
├── ⭐ Reviews & Feedback
│   ├── All Reviews (for company's phones)
│   ├── Respond to Reviews
│   ├── Review Analytics (average scores, trends)
│   └── Q&A Management
│       - View Questions
│       - Post Answers
│       - Flag Inappropriate Content
│
├── 📱 Phone Suggestions
│   ├── Suggest New Phone
│   ├── Suggest Info Update (specs, price, images)
│   ├── Suggestion History
│   └── Suggestion Status Tracking
│
├── 💰 Billing
│   ├── Account Balance
│   ├── Add Funds
│   ├── Transaction History
│   ├── Invoices
│   └── Payment Methods
│
└── 🤝 Sponsorship Requests
    ├── Request Homepage Feature
    ├── Request Brand Spotlight
    ├── Request Comparison Sponsorship
    ├── Request History
    └── Custom Package Inquiry
```

---

## 2. Portal Features

### 2.1 Self-Service Campaign Creation
The campaign wizard guides advertisers through a step-by-step process:
- No need to contact admin for standard campaigns
- Templates for quick campaign setup
- Real-time budget estimation
- Preview of ad placement

### 2.2 Real-Time Reporting
- Live dashboard with key metrics
- Hourly/daily/weekly/monthly views
- Comparative analysis (this period vs last)
- Export capabilities

### 2.3 Brand Identity Management
- Companies can manage their brand appearance on the platform
- Upload logos, cover images, descriptions
- Manage showroom profiles
- Respond to user interactions

### 2.4 Approval Workflows
Some actions require admin approval:
- New campaign launch (optional, configurable)
- Phone info update suggestions
- Sponsorship requests
- Large budget campaigns

---

## 3. Access Control

| Feature | Company Admin | Company Member |
|---------|:------------:|:--------------:|
| Dashboard | ✓ | ✓ |
| Create Campaign | ✓ | ✓ |
| Manage Budget | ✓ | ✗ |
| Team Management | ✓ | ✗ |
| View Reports | ✓ | ✓ |
| Respond to Reviews | ✓ | ✓ |
| Manage Showrooms | ✓ | ✓ |
| Billing & Payments | ✓ | ✗ |
| Account Settings | ✓ | ✗ |
| Phone Suggestions | ✓ | ✓ |
