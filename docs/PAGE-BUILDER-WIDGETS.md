# المرحلة 2: تقسيم الـ Widgets إلى أقسام رئيسية

## نظام التصنيف

كل Widget ينتمي لقسم واحد فقط. الأقسام مرتبة من الأساسي (Layout) إلى المتقدم (Tools).

---

## 1) Layouts — هياكل الصفحة

الغرض: تحديد بنية الصفحة وتقسيم المساحة.

| Widget | الوصف | canHaveChildren | Props الرئيسية |
|--------|-------|-----------------|----------------|
| **Section** | حاوية رئيسية بـ max-width + padding | ✅ | `maxWidth`, `paddingY`, `paddingX`, `background`, `fullBleed` |
| **Grid** | شبكة CSS Grid | ✅ | `columns`, `gap`, `minChildWidth`, `alignItems` |
| **Columns** | عمودين أو أكثر بنسب محددة | ✅ | `distribution` (50/50, 33/67, etc.), `gap`, `stackOnMobile` |
| **Container** | حاوية بسيطة مع أنماط | ✅ | `padding`, `margin`, `background`, `borderRadius`, `shadow` |
| **ResponsiveWrapper** | يتحكم بالظهور حسب الشاشة | ✅ | `showOn` (mobile/tablet/desktop/all), `breakpoint` |

### مبدأ التصميم
- كل Layout widget يقبل children
- لا يحتوي على محتوى خاص به — فقط ينظم children
- يدعم responsive عبر Tailwind breakpoints
- يدعم dark mode عبر background tokens

---

## 2) Content — المحتوى

الغرض: عرض المحتوى النصي والمرئي.

| Widget | الوصف | canHaveChildren | Props الرئيسية |
|--------|-------|-----------------|----------------|
| **TextBlock** | نص عادي مع تنسيق | ❌ | `text`, `tag` (h1-h6/p/span), `align`, `color`, `fontSize` |
| **ImageBlock** | صورة مع alt text | ❌ | `src`, `alt`, `width`, `height`, `objectFit`, `lazy`, `priority` |
| **RichText** | محتوى HTML غني (Tiptap compatible) | ❌ | `html`, `maxWidth`, `prose` |
| **HtmlBlock** | HTML خام (للحالات الخاصة) | ❌ | `code`, `sandboxed` |
| **MediaEmbed** | YouTube, Vimeo, Twitter embeds | ❌ | `url`, `type` (youtube/vimeo/twitter), `aspectRatio` |

### مبدأ التصميم
- لا يقبل children (leaf nodes)
- يركز على عرض المحتوى بشكل متناسق
- ImageBlock يستخدم Next.js `<Image>` لتحسين الأداء
- RichText متوافق مع Tiptap المستخدم حالياً في المشروع

---

## 3) Controls — عناصر التحكم

الغرض: عناصر تفاعلية يتفاعل معها المستخدم.

| Widget | الوصف | canHaveChildren | Props الرئيسية |
|--------|-------|-----------------|----------------|
| **Button** | زر قابل للضغط | ❌ | `label`, `variant` (primary/secondary/outline/ghost), `size` (sm/md/lg), `href`, `onClick`, `icon`, `fullWidth` |
| **TextInput** | حقل إدخال نصي | ❌ | `placeholder`, `label`, `name`, `type` (text/email/password/number), `required`, `stateKey` |
| **FormBlock** | حاوية نموذج | ✅ | `action`, `method`, `onSubmit`, `successMessage`, `errorMessage` |
| **Toggle** | مفتاح تبديل | ❌ | `label`, `stateKey`, `defaultChecked`, `size` |
| **Dropdown** | قائمة منسدلة | ❌ | `label`, `options` (array of {label, value}), `stateKey`, `placeholder`, `multiple` |

### مبدأ التصميم
- كل Control يربط حالته بـ `stateKey` في Builder state
- هذا يسمح لـ widgets أخرى بقراءة القيمة
- FormBlock يقبل children (TextInput, Button, etc.)
- الأنماط متناسقة مع Design System

---

## 4) Data — البيانات

الغرض: جلب البيانات وربطها وتحويلها.

| Widget | الوصف | canHaveChildren | Props الرئيسية |
|--------|-------|-----------------|----------------|
| **ApiFetch** | يجلب بيانات من API ويخزنها في state | ✅ | `url`, `method`, `headers`, `stateKey`, `autoFetch`, `loadingWidget`, `errorWidget` |
| **DataBinding** | يربط قيمة من state بعنصر عرض | ❌ | `stateKey`, `path` (dot notation), `fallback`, `format` (text/number/date/currency) |
| **StateMapper** | يحول بيانات من شكل لآخر | ❌ | `sourceKey`, `targetKey`, `transform` (map/filter/sort/slice), `expression` |
| **QueryTool** | يجلب بيانات من Prisma API الداخلية | ✅ | `model` (phones/brands/articles), `filters`, `sort`, `limit`, `stateKey` |

### مبدأ التصميم
- **ApiFetch** هو الأداة الرئيسية — يجلب ويخزن في state
- **QueryTool** مختصر لـ ApiFetch — يستدعي API routes الموجودة في المشروع
- children في ApiFetch/QueryTool يُعرضون بعد نجاح الجلب
- كل أداة تكتب نتائجها في `stateKey` ليقرأها widgets آخرون
- fallback behavior واضح (loading state, error message, empty state)

---

## 5) Logical — المنطق

الغرض: التحكم بتدفق العرض (conditional/loop/dynamic).

| Widget | الوصف | canHaveChildren | Props الرئيسية |
|--------|-------|-----------------|----------------|
| **Condition** | يعرض children إن تحقق الشرط | ✅ | `when` (expression string), `stateKey`, `operator` (eq/neq/gt/lt/contains/exists), `value`, `elseShow` |
| **Loop** | يكرر children لكل عنصر في مصفوفة | ✅ | `stateKey`, `itemKey` (اسم المتغير في كل تكرار), `emptyMessage` |
| **VisibilityRule** | يتحكم بظهور children حسب قواعد | ✅ | `rules` (array of {type, value}), `logic` (and/or) |
| **DynamicSlot** | يعرض widget محدد ديناميكياً | ❌ | `widgetType`, `propsFromState`, `fallback` |

### مبدأ التصميم
- **Condition** يقيّم expression ضد Builder state
- **Loop** يقرأ مصفوفة من state ويكرر children مع تمرير العنصر الحالي
- **VisibilityRule** أبسط من Condition — قواعد محددة (auth, screen size, time)
- **DynamicSlot** يسمح بتحديد نوع Widget في runtime (meta-widget)

---

## 6) List — القوائم

الغرض: عرض مجموعات بيانات كقوائم مكررة.

| Widget | الوصف | canHaveChildren | Props الرئيسية |
|--------|-------|-----------------|----------------|
| **Repeater** | يكرر template لكل عنصر في مصفوفة ثابتة | ✅ | `items` (array of objects), `itemKey`, `layout` (list/grid/carousel) |
| **CollectionRenderer** | يعرض collection من state كقائمة | ✅ | `stateKey`, `layout` (list/grid), `columns`, `gap`, `emptyMessage`, `loadingMessage` |
| **DynamicList** | قائمة مع pagination وsorting | ✅ | `stateKey`, `pageSize`, `sortable`, `layout`, `showPagination` |

### مبدأ التصميم
- **Repeater** لبيانات ثابتة (يُعرّفها المحرر يدوياً)
- **CollectionRenderer** لبيانات ديناميكية (من state — عادةً بعد ApiFetch)
- **DynamicList** = CollectionRenderer + pagination + sorting
- children في كل واحد هم "template" يُكرر لكل عنصر
- يدعم `layout` مختلف (list, grid, carousel)

---

## 7) Tools — أدوات جاهزة

الغرض: وظائف كاملة جاهزة للاستخدام (high-level widgets).

| Widget | الوصف | canHaveChildren | Props الرئيسية |
|--------|-------|-----------------|----------------|
| **SearchWidget** | بحث كامل مع نتائج | ❌ | `placeholder`, `endpoint`, `stateKey`, `debounceMs`, `minChars`, `showSuggestions`, `resultTemplate` |
| **FilterWidget** | فلاتر ديناميكية | ❌ | `filters` (array of {name, type, options}), `stateKey`, `layout` (horizontal/vertical), `showClear` |
| **ActionButton** | زر ينفذ عملية (API call, navigation, state change) | ❌ | `label`, `action` (navigate/api-call/set-state), `config` (url/method/stateKey/value), `variant`, `confirmMessage` |
| **AiResponseWidget** | يعرض استجابة من AI endpoint | ❌ | `prompt`, `endpoint`, `stateKey`, `streamMode`, `loadingText` |
| **NavigationMenu** | قائمة تنقل ديناميكية | ❌ | `items` (array of {label, href, icon, children}), `layout` (horizontal/vertical/dropdown), `activeStyle` |

### مبدأ التصميم
- أدوات **عالية المستوى** — كل واحدة تحل مشكلة كاملة
- **SearchWidget** يتكامل مع Meilisearch الموجود في المشروع
- **FilterWidget** يكتب الفلاتر في state → يقرأها ApiFetch/QueryTool
- **ActionButton** مثل Button لكن مع منطق تنفيذ مدمج
- **AiResponseWidget** يستدعي AI endpoint ويعرض النتيجة (streaming)
- **NavigationMenu** قابل للتخصيص بالكامل من Visual Editor

---

## ملخص الإحصائيات

| القسم | عدد الـ Widgets | canHaveChildren |
|-------|-----------------|-----------------|
| Layouts | 5 | الكل ✅ |
| Content | 5 | ❌ |
| Controls | 5 | FormBlock فقط ✅ |
| Data | 4 | ApiFetch + QueryTool ✅ |
| Logical | 4 | 3 من 4 ✅ |
| List | 3 | الكل ✅ |
| Tools | 5 | ❌ |
| **المجموع** | **31 Widget** | |

---

## العلاقة بين الأقسام

```
Layouts ──────── تنظم البنية
    ↓
Content ──────── تعرض المحتوى الثابت
Controls ─────── تستقبل مدخلات المستخدم → تكتب في state
    ↓
Data ─────────── تجلب بيانات → تكتب في state
Logical ──────── تتحكم بالعرض بناءً على state
    ↓
List ─────────── تعرض مجموعات من state
Tools ─────────── وظائف كاملة تجمع عدة مفاهيم
```

---

## الخطوة التالية: المرحلة 3

تصميم TypeScript interfaces + Widget Registry + Dynamic Renderer.
