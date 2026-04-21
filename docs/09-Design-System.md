# Design System
# MobilePlatform

---

## 1. Design Principles

1. **Mobile-First**: Design for small screens first, then scale up
2. **Clean & Modern**: Minimalist design with clear hierarchy
3. **Consistent**: Unified patterns across all interfaces
4. **Accessible**: WCAG 2.1 AA compliance
5. **Fast**: Perceived performance through skeleton loading and transitions
6. **Information-Dense**: Show maximum useful info without clutter

---

## 2. Color System

### Primary Palette
```css
--primary-50:  #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* Primary */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
```

### Neutral Palette
```css
--gray-50:  #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

### Semantic Colors
```css
--success: #10b981;
--warning: #f59e0b;
--error:   #ef4444;
--info:    #3b82f6;
```

### Status Colors
```css
--available:    #10b981;  /* Green */
--coming-soon:  #f59e0b;  /* Amber */
--discontinued: #6b7280;  /* Gray */
```

---

## 3. Typography

### Font Stack
```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
--font-display: 'Inter', system-ui, sans-serif;
```

### Scale
| Name | Size | Weight | Usage |
|------|------|--------|-------|
| Display | 36px / 2.25rem | 700 | Page heroes |
| H1 | 30px / 1.875rem | 700 | Page titles |
| H2 | 24px / 1.5rem | 600 | Section titles |
| H3 | 20px / 1.25rem | 600 | Sub-sections |
| H4 | 18px / 1.125rem | 600 | Card titles |
| Body | 16px / 1rem | 400 | Body text |
| Small | 14px / 0.875rem | 400 | Secondary text |
| XSmall | 12px / 0.75rem | 400 | Labels, captions |

---

## 4. Spacing System

Using Tailwind's default spacing scale (4px base):
```
4px   (1)   - Tight spacing
8px   (2)   - Element spacing
12px  (3)   - Compact spacing
16px  (4)   - Standard spacing
20px  (5)   - Comfortable spacing
24px  (6)   - Section padding
32px  (8)   - Large spacing
48px  (12)  - Section gaps
64px  (16)  - Page sections
```

---

## 5. Component Library

### 5.1 Phone Card (Search Result)
```
┌───────────────────────────────────────────┐
│  ┌─────────┐                              │
│  │         │  Samsung Galaxy S24 Ultra     │
│  │  Phone  │  $1,299 · Available          │
│  │  Image  │  ⭐ 9.2 · Updated: Jan 2024  │
│  │         │                              │
│  └─────────┘                              │
│  ─────────────────────────────────────────│
│  Key Specifications                       │
│  💾 256GB    🧠 12GB    📷 200MP  🤳 12MP │
│  📺 6.8"    🔋 5000mAh                   │
│  ─────────────────────────────────────────│
│  Extra Specifications                     │
│  👆 Ultrasonic  ⚡ 45W    💧 IP68        │
│  📶 Wi-Fi 7    🛡️ Gorilla  📡 BT 5.3    │
└───────────────────────────────────────────┘
```

### 5.2 Phone Detail Header
```
┌───────────────────────────────────────────────────┐
│  Breadcrumb: Home > Samsung > Galaxy S24 Ultra    │
│                                                   │
│  ┌──────────────┐  Samsung Galaxy S24 Ultra       │
│  │              │  ────────────────────────        │
│  │   Main       │  Status: Available               │
│  │   Image      │  Released: Jan 2024              │
│  │              │  Brand: Samsung                   │
│  │              │  Price: $1,299                    │
│  └──────────────┘  Updated: Mar 2024               │
│  [thumb] [thumb]                                   │
│                    ┌─── Key Specs ───────────┐     │
│                    │ 💾 256GB  🧠 12GB       │     │
│                    │ 📷 200MP  📺 6.8" AMOLED│     │
│                    │ 🔋 5000mAh  ⚡ 45W      │     │
│                    └─────────────────────────┘     │
│                    [See Full Specs →]               │
│                                                   │
│  ┌─ Quick Nav ──────────────────────────────────┐ │
│  │ Details│Specifications│Review│Discussions│Show│ │
│  └──────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────┘
```

### 5.3 Buttons
```
Primary:   [  Save Phone  ]  → bg-primary-600, white text, rounded-lg
Secondary: [  Cancel      ]  → bg-gray-100, gray-700 text, rounded-lg
Outline:   [  Compare     ]  → border-primary-600, primary text, rounded-lg
Danger:    [  Delete      ]  → bg-red-600, white text, rounded-lg
Ghost:     [  More ›      ]  → transparent, primary text
```

### 5.4 Form Elements
- **Input**: Rounded border, focus ring, label above
- **Select**: Custom styled dropdown with search
- **Checkbox**: Custom checkmark with label
- **Radio**: Custom radio with label
- **Toggle**: iOS-style toggle switch
- **Textarea**: Auto-expanding with character count

### 5.5 Cards
```css
.card {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s;
}
.card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
```

---

## 6. Layout System

### Breakpoints
```css
sm:  640px   /* Small phones landscape */
md:  768px   /* Tablets */
lg:  1024px  /* Small desktop */
xl:  1280px  /* Desktop */
2xl: 1536px  /* Large desktop */
```

### Grid System
- **Public site**: Max width 1280px, centered
- **Admin panel**: Full width with 256px sidebar
- **Search results**: 2-column (filters + results) on desktop, stacked on mobile
- **Phone cards**: 1 column mobile, 2 columns tablet, 3 columns desktop

---

## 7. Icons

Using **Iconify** with a consistent icon set:
- Primary set: `lucide` (clean, modern line icons)
- Fallback: `mdi` (Material Design Icons)

### Spec Icon Registry Default Mapping
| Spec Key | Icon | Source |
|----------|------|--------|
| storage | `lucide:hard-drive` | Iconify |
| ram | `lucide:cpu` | Iconify |
| main_camera | `lucide:camera` | Iconify |
| front_camera | `lucide:user` | Iconify |
| display | `lucide:monitor` | Iconify |
| battery | `lucide:battery-full` | Iconify |
| fingerprint | `lucide:fingerprint` | Iconify |
| charger | `lucide:zap` | Iconify |
| resistance | `lucide:droplets` | Iconify |
| wifi | `lucide:wifi` | Iconify |
| bluetooth | `lucide:bluetooth` | Iconify |
| glass | `lucide:shield` | Iconify |

All icons are configurable from admin — the registry is stored in the database and served dynamically.

---

## 8. Motion & Animation

- **Transitions**: 200ms ease for hover, 300ms ease for modals
- **Skeleton Loading**: Pulsing gray blocks while content loads
- **Page Transitions**: Subtle fade-in on route change
- **Scroll Animations**: Minimal, only for hero sections
- **Micro-interactions**: Button press, toggle switch, checkbox tick

---

## 9. Dark Mode (Future)

The color system is designed to support dark mode via CSS custom properties. Can be enabled later by swapping the palette values.

---

## 10. Admin Theme

The admin panel uses a darker sidebar with the same design system:
- Sidebar: `gray-900` background, white text
- Content area: `gray-50` background
- Cards: White with subtle borders
- Tables: Striped rows for readability
- Status badges: Colored pills with semantic colors
