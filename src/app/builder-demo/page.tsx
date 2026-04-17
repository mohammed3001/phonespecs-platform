'use client';

// =============================================================================
// Page Builder Demo — Showcases all widgets working together (standalone)
// =============================================================================

import { useState } from 'react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

// Import widget components directly (no Builder.io needed for demo)
import { initializeWidgets } from '@/components/builder/widgets';
import { getAllWidgets, getWidgetsByCategory } from '@/lib/builder/registry';
import { WIDGET_CATEGORIES } from '@/lib/builder/types';

// Initialize widgets
initializeWidgets();

// =============================================================================
// Inline widget demos — render each widget with example props
// =============================================================================

function SectionDemo() {
  return (
    <section className="py-8 bg-white dark:bg-slate-900">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-8">
        <div className="bg-teal-50 dark:bg-teal-950 rounded-xl p-8 border border-teal-200 dark:border-teal-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Section Widget</h3>
          <p className="text-gray-600 dark:text-gray-400">
            This is a Section container with max-width, padding, and teal background. It wraps content with consistent spacing.
          </p>
        </div>
      </div>
    </section>
  );
}

function GridDemo() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center text-teal-600 dark:text-teal-400 text-xl font-bold">
            {i}
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Grid Item {i}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Responsive 3-column grid</p>
        </div>
      ))}
    </div>
  );
}

function ColumnsDemo() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Main Content (67%)</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">Two-column layout with 67/33 distribution. Stacks on mobile.</p>
      </div>
      <div className="bg-teal-50 dark:bg-teal-950 rounded-xl border border-teal-200 dark:border-teal-800 p-6">
        <h4 className="font-semibold text-teal-800 dark:text-teal-200 mb-2">Sidebar (33%)</h4>
        <p className="text-sm text-teal-600 dark:text-teal-400">Side panel for filters, ads, or related content.</p>
      </div>
    </div>
  );
}

function TextBlockDemo() {
  return (
    <div className="space-y-3">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">Heading 1 — Bold Statement</h1>
      <h2 className="text-2xl font-bold text-teal-600 dark:text-teal-400">Heading 2 — Primary Color</h2>
      <p className="text-base text-gray-700 dark:text-gray-300">Body text — Regular paragraph with default styling. Supports all heading levels (h1-h6), paragraph, and span tags.</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Caption — Muted smaller text for supporting information.</p>
    </div>
  );
}

function ImageDemo() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="overflow-hidden rounded-xl shadow-md">
        <div className="aspect-video bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
          <span className="text-white text-lg font-bold">Image Block — Cover</span>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl shadow-md">
        <div className="aspect-video bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
          <span className="text-white text-lg font-bold">Image Block — Contain</span>
        </div>
      </div>
    </div>
  );
}

function ButtonDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <button className="px-5 py-2.5 text-base rounded-lg font-medium bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all">
        Primary
      </button>
      <button className="px-5 py-2.5 text-base rounded-lg font-medium bg-slate-600 hover:bg-slate-700 text-white shadow-sm transition-all">
        Secondary
      </button>
      <button className="px-5 py-2.5 text-base rounded-lg font-medium border-2 border-teal-600 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-950 transition-all">
        Outline
      </button>
      <button className="px-5 py-2.5 text-base rounded-lg font-medium text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-950 transition-all">
        Ghost
      </button>
      <button className="px-5 py-2.5 text-base rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all">
        Danger
      </button>
    </div>
  );
}

function TextInputDemo() {
  const [value, setValue] = useState('');
  return (
    <div className="max-w-md space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="you@example.com"
          className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">We&apos;ll never share your email</p>
      </div>
    </div>
  );
}

function SearchDemo() {
  const [query, setQuery] = useState('');
  const mockResults = [
    { title: 'Samsung Galaxy S24 Ultra', desc: '6.8" Dynamic AMOLED, Snapdragon 8 Gen 3' },
    { title: 'iPhone 15 Pro Max', desc: '6.7" Super Retina XDR, A17 Pro' },
    { title: 'Google Pixel 8 Pro', desc: '6.7" LTPO OLED, Tensor G3' },
  ].filter((r) => query.length >= 2 && r.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="max-w-lg relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Search Phones</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try typing 'samsung'..."
          className="w-full pl-10 pr-4 py-3 text-base rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
        />
      </div>
      {mockResults.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg">
          <ul className="py-1">
            {mockResults.map((r) => (
              <li key={r.title} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{r.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function RepeaterDemo() {
  const items = [
    { title: 'Samsung', desc: 'Galaxy S24, A15, Z Fold', color: 'from-blue-500 to-blue-600' },
    { title: 'Apple', desc: 'iPhone 15, SE, iPad', color: 'from-gray-700 to-gray-900' },
    { title: 'Google', desc: 'Pixel 8, 7a, Tensor', color: 'from-green-500 to-teal-600' },
    { title: 'OnePlus', desc: '12, Nord, Open', color: 'from-red-500 to-red-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.title} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all">
          <div className={`h-24 bg-gradient-to-br ${item.color} flex items-center justify-center`}>
            <span className="text-white text-2xl font-bold">{item.title[0]}</span>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
            <span className="inline-block mt-2 text-sm text-teal-600 dark:text-teal-400 hover:underline cursor-pointer">Learn more →</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ConditionDemo() {
  const [showContent, setShowContent] = useState(true);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowContent(!showContent)}
          className="px-4 py-2 text-sm rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-all"
        >
          Toggle Condition ({showContent ? 'ON' : 'OFF'})
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          state.showHero = {String(showContent)}
        </span>
      </div>
      {showContent && (
        <div className="border-2 border-dashed border-teal-300 dark:border-teal-700 rounded-lg p-4">
          <div className="text-xs text-teal-600 dark:text-teal-400 mb-2 font-mono">⚡ Condition: state.showHero === true</div>
          <p className="text-gray-700 dark:text-gray-300">This content is conditionally rendered based on Builder state.</p>
        </div>
      )}
    </div>
  );
}

function NavigationDemo() {
  const items = [
    { label: 'Home', active: true },
    { label: 'Phones', active: false },
    { label: 'Brands', active: false },
    { label: 'Compare', active: false },
    { label: 'News', active: false },
  ];
  return (
    <nav className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-3">
      <ul className="flex items-center gap-1">
        {items.map((item) => (
          <li key={item.label}>
            <span
              className={`
                inline-flex items-center px-3 py-2 text-base rounded-lg cursor-pointer transition-colors
                ${item.active
                  ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                }
              `}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ApiFetchDemo() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-4 bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 rounded-lg">
        <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-teal-700 dark:text-teal-300">Fetching from /api/phones?limit=5...</span>
      </div>
      <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
        <p className="text-sm text-green-700 dark:text-green-300 font-mono">
          ✓ Data stored in state.phones (5 items)
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// Widget Showcase Card
// =============================================================================

interface WidgetShowcaseProps {
  title: string;
  category: string;
  categoryIcon: string;
  description: string;
  children: React.ReactNode;
}

function WidgetShowcase({ title, category, categoryIcon, description, children }: WidgetShowcaseProps) {
  return (
    <div className="bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-700/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700/50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {categoryIcon} {category}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// Main Demo Page
// =============================================================================

export default function BuilderDemoPage() {
  const widgets = getAllWidgets();
  const categories = WIDGET_CATEGORIES;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {/* Hero */}
        <section className="relative py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent" />
          <div className="relative max-w-screen-xl mx-auto px-6 sm:px-8">
            <div className="text-center">
              <span className="inline-block px-3 py-1 text-xs font-medium bg-teal-500/20 text-teal-300 rounded-full border border-teal-500/30 mb-4">
                Page Builder System
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
                Tools as <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Widgets</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
                {widgets.length} widgets across {categories.length} categories — each one production-ready, type-safe, and integrated with Builder.io Visual Editor.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((cat) => {
                  const count = getWidgetsByCategory(cat.id).length;
                  return (
                    <span
                      key={cat.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white/5 backdrop-blur-sm text-gray-300 rounded-lg border border-white/10"
                    >
                      {cat.icon} {cat.name}
                      <span className="text-teal-400 font-semibold">{count}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Widget Demos */}
        <section className="max-w-screen-xl mx-auto px-6 sm:px-8 py-12">
          <div className="space-y-8">
            {/* Layouts */}
            <WidgetShowcase title="Section" category="Layouts" categoryIcon="📐" description="Primary page container with max-width, padding, and background options">
              <SectionDemo />
            </WidgetShowcase>

            <WidgetShowcase title="Grid" category="Layouts" categoryIcon="📐" description="CSS Grid layout with responsive columns (1-6)">
              <GridDemo />
            </WidgetShowcase>

            <WidgetShowcase title="Columns" category="Layouts" categoryIcon="📐" description="Two or more columns with predefined distributions (67/33 shown)">
              <ColumnsDemo />
            </WidgetShowcase>

            {/* Content */}
            <WidgetShowcase title="Text Block" category="Content" categoryIcon="📝" description="Text with semantic tags (h1-h6, p), colors, sizes, and weights">
              <TextBlockDemo />
            </WidgetShowcase>

            <WidgetShowcase title="Image Block" category="Content" categoryIcon="📝" description="Optimized images with Next.js Image, border radius, and shadow options">
              <ImageDemo />
            </WidgetShowcase>

            {/* Controls */}
            <WidgetShowcase title="Button" category="Controls" categoryIcon="🎛️" description="5 variants (Primary, Secondary, Outline, Ghost, Danger) with link support">
              <ButtonDemo />
            </WidgetShowcase>

            <WidgetShowcase title="Text Input" category="Controls" categoryIcon="🎛️" description="Form input with label, validation, helper text, and Builder state binding">
              <TextInputDemo />
            </WidgetShowcase>

            {/* Data */}
            <WidgetShowcase title="API Fetch" category="Data" categoryIcon="🔌" description="Fetches data from any API and stores results in Builder state for other widgets">
              <ApiFetchDemo />
            </WidgetShowcase>

            {/* Logical */}
            <WidgetShowcase title="Condition" category="Logical" categoryIcon="🧠" description="Show/hide children based on Builder state (eq, neq, gt, lt, contains, exists)">
              <ConditionDemo />
            </WidgetShowcase>

            {/* List */}
            <WidgetShowcase title="Repeater" category="List" categoryIcon="📋" description="Renders cards for each item in a static array with grid/list/carousel layout">
              <RepeaterDemo />
            </WidgetShowcase>

            {/* Tools */}
            <WidgetShowcase title="Search Widget" category="Tools" categoryIcon="🛠️" description="Full search with autocomplete, debounce, and dropdown — integrated with Meilisearch">
              <SearchDemo />
            </WidgetShowcase>

            <WidgetShowcase title="Navigation Menu" category="Tools" categoryIcon="🛠️" description="Dynamic nav with horizontal/vertical/dropdown layout and nested items">
              <NavigationDemo />
            </WidgetShowcase>
          </div>
        </section>

        {/* Registry Summary */}
        <section className="max-w-screen-xl mx-auto px-6 sm:px-8 pb-16">
          <div className="bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-700/50 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Widget Registry</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((cat) => {
                const catWidgets = getWidgetsByCategory(cat.id);
                return (
                  <div key={cat.id} className="bg-gray-50 dark:bg-slate-700/30 rounded-xl p-4">
                    <div className="text-2xl mb-2">{cat.icon}</div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{cat.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{cat.description}</p>
                    <ul className="space-y-1">
                      {catWidgets.map((w) => (
                        <li key={w.id} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                          {w.name}
                        </li>
                      ))}
                      {catWidgets.length === 0 && (
                        <li className="text-sm text-gray-400 dark:text-gray-500 italic">Coming soon</li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-teal-600 dark:text-teal-400">{widgets.length}</span> widgets registered across{' '}
                <span className="font-semibold text-teal-600 dark:text-teal-400">{categories.length}</span> categories
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
