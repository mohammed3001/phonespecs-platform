# المرحلة 1: التحليل المعماري — Page Builder System (Tools as Widgets)

## الوضع الحالي للمشروع

المشروع مبني على:
- **Next.js 14 (App Router)** — React 18, TypeScript
- **Prisma + PostgreSQL** — قاعدة بيانات
- **Tailwind CSS** — تصميم (darkMode: "class")
- **بنية الملفات**: `src/app/` (routes) + `src/components/` (shared/public/admin) + `src/lib/` (services) + `src/types/`
- **لا يوجد Builder.io حالياً** — يجب إضافته كتكامل جديد

### Assumptions
1. Builder.io سيُستخدم كمحرر بصري لبناء الصفحات — وليس كبديل لـ Next.js routing
2. الصفحات الحالية (homepage, phones, brands, etc.) تبقى كما هي — Builder.io يُضاف كنظام إضافي لصفحات مخصصة
3. الـ Widgets ستكون React components مسجلة في Builder.io + قابلة للاستخدام خارجه
4. النظام يجب أن يعمل مع Server Components + Client Components (Next.js App Router)

---

## 1) Page Composition System — كيف ستُبنى الصفحات

### المعمارية
```
Builder.io Visual Editor
    ↓ (يحفظ JSON content)
Builder.io API
    ↓ (fetchOneEntry)
Next.js Catch-all Route /builder/[...page]
    ↓ (يمرر content + custom components)
<Content> component (Builder SDK)
    ↓ (يقرأ JSON ويحول إلى React tree)
Widget Components (مسجلة عبر customComponents)
```

### التدفق
1. المستخدم يبني الصفحة في Builder.io Visual Editor (drag & drop)
2. Builder.io يحفظ الصفحة كـ JSON document في API الخاص به
3. عند الطلب، Next.js يجلب الـ JSON عبر `fetchOneEntry()`
4. مكون `<Content>` من Builder SDK يحول الـ JSON إلى React components
5. كل Widget مسجل يُنفذ كـ React component عادي

### لماذا هذا التصميم
- **لا نكسر البنية الحالية**: الصفحات الموجودة لا تتأثر
- **فصل واضح**: Builder pages في route خاص (`/builder/[...page]`)
- **مرونة**: يمكن استخدام Builder لصفحات هبوط، حملات تسويقية، صفحات مؤقتة
- **SSR/ISR**: Next.js يتحكم بالـ rendering strategy

---

## 2) Widget Representation — كيف تُمثل الـ Widgets

### طبقتان منفصلتان

**الطبقة 1: Widget الداخلي (React Component)**
- مكون React عادي (`TSX`)
- يقبل `props` محددة بـ TypeScript interface
- يستخدم Design System tokens (spacing, colors, typography)
- يدعم `light/dark` theme عبر Tailwind `dark:` classes
- يدعم `responsive` عبر Tailwind breakpoints
- مستقل تماماً — يعمل داخل Builder أو خارجه

**الطبقة 2: Builder Registration (Schema)**
- `name`: اسم فريد في Builder
- `inputs`: تعريف الـ props القابلة للتعديل في Visual Editor
- `category`: تصنيف في Insert panel
- `defaultStyles`: أنماط افتراضية
- `canHaveChildren`: هل يقبل children
- `image`: أيقونة العرض في Editor

### لماذا طبقتان
- **قابلية الاختبار**: يمكن اختبار Widget بدون Builder
- **إعادة الاستخدام**: Widget يعمل في أي مكان (ليس فقط Builder pages)
- **فصل المسؤوليات**: الـ UI logic منفصل عن Builder SDK coupling
- **سهولة الصيانة**: تغيير Builder inputs لا يؤثر على الـ component الداخلي

---

## 3) Builder.io Integration — كيف يتم الربط

### SDK المختار: `@builder.io/sdk-react-nextjs` (Gen 2)
- مصمم لـ Next.js App Router
- يدعم Server Components
- يدعم `fetchOneEntry()` في server-side
- يدعم `customComponents` prop في `<Content>`

### التكامل
```
[Builder.io Dashboard] ← API Key → [Next.js App]
                                        ↓
                               /builder/[...page]/page.tsx (Server Component)
                                        ↓
                               fetchOneEntry({ model: 'page', apiKey, userAttributes })
                                        ↓
                               <RenderBuilderContent content={content} />
                                        ↓
                               <Content> with customComponents={registeredWidgets}
```

### الملفات المطلوبة
- `src/lib/builder/client.ts` — Builder client configuration
- `src/lib/builder/registry.ts` — Widget registration (maps widgets → Builder schemas)
- `src/app/builder/[...page]/page.tsx` — Catch-all route for Builder pages
- `src/components/builder/RenderBuilderContent.tsx` — Client component wrapper

### لماذا Gen 2 SDK
- يدعم RSC (React Server Components)
- أداء أفضل (tree-shakeable)
- API أبسط من Gen 1
- الخيار الرسمي لـ Next.js App Router

---

## 4) State Management — كيف تُدار الحالة

### ثلاث طبقات للحالة

**طبقة 1: Builder State (content-level)**
- `state` object يديره Builder.io
- يُستخدم لـ data bindings بين widgets في نفس الصفحة
- يُعرّف عبر `state` property في Builder content JSON
- مثال: `state.searchQuery`, `state.selectedFilter`

**طبقة 2: Widget Local State (component-level)**
- `useState` / `useReducer` داخل كل Widget
- حالة خاصة بالـ Widget فقط (مثل: toggle open/close, input value)
- لا تُشارك مع widgets أخرى

**طبقة 3: Application State (app-level)**
- ThemeProvider (dark/light mode) — موجود حالياً
- React Context لحالة مشتركة بين widgets (إن لزم)
- Server-side data من Prisma queries

### لماذا لا نستخدم Redux/Zustand
- Builder.io يوفر state management خاص به عبر `state` object
- معظم Widgets تحتاج حالة محلية فقط
- التعقيد الإضافي غير مبرر في V1
- يمكن إضافة global state manager لاحقاً إن ظهرت الحاجة

---

## 5) Data Flow Between Widgets — كيف تتمرر البيانات

### ثلاث آليات

**آلية 1: Builder State Bindings (الرئيسية)**
```
Widget A (Data Fetch) → يكتب في state.products
Widget B (List) → يقرأ من state.products
Widget C (Filter) → يعدل state.filters → يعيد Widget A الجلب
```
- Builder.io يوفر هذه الآلية أصلاً عبر `@builder.io/sdk`
- لا نحتاج اختراع نظام messaging خاص
- يعمل declaratively عبر Visual Editor

**آلية 2: Props من Builder (سياقية)**
- كل Widget يستقبل props من Builder content JSON
- المحرر البصري يحدد القيم
- مثال: SearchWidget يستقبل `placeholder`, `endpoint`, `resultsLimit`

**آلية 3: React Context (للحالات المعقدة)**
- لحالات لا يغطيها Builder state
- مثال: PageBuilderContext يوفر theme tokens + API endpoints
- يُغلف `<Content>` بـ Context Provider

### لماذا هذا التصميم
- يستفيد من Builder.io's built-in capabilities بدلاً من إعادة الاختراع
- يبقي Widgets بسيطة (props in, UI out)
- يسمح بتبادل البيانات بدون coupling مباشر

---

## 6) Permissions & Visibility — كيف يُتحكم بالصلاحيات والظهور

### ثلاث طبقات

**طبقة 1: Builder.io Content Permissions**
- Builder.io يتحكم بمن يستطيع تعديل المحتوى
- Roles في Builder dashboard (Admin, Editor, Viewer)
- لا نحتاج بناء نظام صلاحيات خاص بالمحرر

**طبقة 2: Widget Visibility Rules (runtime)**
- كل Widget يقبل `visibility` prop:
  - `visibleWhen`: شرط ظهور (expression يُقيّم ضد Builder state)
  - `hideOnMobile` / `hideOnDesktop`: responsive visibility
  - `requireAuth`: يظهر فقط للمستخدمين المسجلين
- Builder.io يدعم `showIf` expressions أصلاً
- يمكن ربطها بـ user authentication state

**طبقة 3: requiredPermissions على مستوى التسجيل**
- Builder.io يدعم `requiredPermissions` عند التسجيل
- يتحكم بمن يستطيع إضافة Widget معين في Editor
- مثال: AdminOnlyWidget يتطلب `admin` permission في Builder

### لماذا هذا التصميم
- يستفيد من Builder.io's built-in permission system
- يضيف طبقة visibility runtime بسيطة
- لا يكرر نظام الصلاحيات الموجود في المشروع (RBAC)

---

## 7) Design Consistency — كيف يُضمن التناسق

### Design Tokens System
```
src/lib/builder/design-tokens.ts
  ├── spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem', 2xl: '3rem' }
  ├── typography: { h1, h2, h3, h4, body, caption, small }
  ├── colors: { primary, secondary, accent, surface, background, text, border }
  ├── radii: { none, sm, md, lg, xl, full }
  └── shadows: { sm, md, lg, xl }
```

### كيف يُفرض التناسق
1. **Base Widget Wrapper**: كل Widget يُغلف بـ `<WidgetWrapper>` يضمن padding/margin/responsive
2. **Tailwind Classes**: كل Widget يستخدم Tailwind utility classes المتسقة مع باقي المشروع
3. **Theme Variables**: CSS custom properties (`--background`, `--foreground`) موجودة حالياً
4. **Builder defaultStyles**: كل Widget مسجل بأنماط افتراضية متناسقة
5. **Dark Mode**: كل Widget يدعم `dark:` variants عبر Tailwind

### لماذا هذا التصميم
- يتوافق مع Tailwind الموجود حالياً
- لا يضيف dependency جديدة (CSS-in-JS, styled-components)
- Design tokens كـ constants → type-safe → قابلة للاستيراد
- يضمن أن أي Widget جديد يكون متناسقاً تلقائياً

---

## القرارات المعمارية الرئيسية

| القرار | الاختيار | السبب |
|--------|---------|-------|
| SDK | `@builder.io/sdk-react-nextjs` (Gen 2) | يدعم App Router + RSC |
| Route | `/builder/[...page]` catch-all | لا يكسر البنية الحالية |
| State | Builder state + local useState | بسيط وكافي لـ V1 |
| Styling | Tailwind + Design Tokens | متسق مع المشروع الحالي |
| Widget Structure | طبقتان (Component + Schema) | فصل المسؤوليات |
| Data Flow | Builder state bindings | يستفيد من built-in capabilities |
| Permissions | Builder permissions + visibility props | لا يكرر RBAC الموجود |

---

## المخاطر والتخفيف

| المخطر | التخفيف |
|--------|---------|
| Builder.io API key مطلوب | يُخزن في `.env` كـ `NEXT_PUBLIC_BUILDER_API_KEY` |
| Builder.io down | الصفحات الأساسية لا تعتمد عليه — fallback message |
| SDK size | Gen 2 tree-shakeable — حجم أقل من Gen 1 |
| Dev mode hydration | Widget wrappers تتعامل مع client/server boundaries |
| Type safety | TypeScript interfaces لكل Widget + Builder inputs |

---

## الخطوة التالية: المرحلة 2

تقسيم الـ Widgets إلى 7 أقسام رئيسية مع تعريف كل Widget بالتفصيل.
