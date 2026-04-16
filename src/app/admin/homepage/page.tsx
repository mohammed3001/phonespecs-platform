"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";

interface Setting {
  key: string;
  value: string;
}

export default function AdminHomepagePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [config, setConfig] = useState({
    hero_title: "Discover the Latest Smartphones",
    hero_subtitle: "Compare specs, read reviews, and find the perfect phone for you",
    hero_cta_text: "Browse Phones",
    hero_cta_url: "/phones",
    featured_section_title: "Featured Phones",
    featured_phones_count: "6",
    show_latest_reviews: "true",
    show_latest_articles: "true",
    show_comparison_cta: "true",
    footer_text: "MobilePlatform - Your trusted smartphone comparison platform",
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const vals: Record<string, string> = {};
          data.data.forEach((s: Setting) => { vals[s.key] = s.value; });
          setConfig((prev) => ({
            ...prev,
            ...Object.fromEntries(
              Object.keys(prev).filter((k) => vals[k] !== undefined).map((k) => [k, vals[k]])
            ),
          }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const settings = Object.entries(config).map(([key, value]) => ({ key, value, group: "homepage" }));
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Homepage settings saved");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Homepage Configuration</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl border p-6"><div className="h-8 bg-gray-200 rounded w-48" /></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage Configuration</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure the public homepage layout and content</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
          {saving && <Icon icon="mdi:loading" className="animate-spin" width={16} />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

      {/* Hero Section */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Icon icon="mdi:image-area" width={18} className="text-blue-600" />
          Hero Section
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={config.hero_title} onChange={(e) => setConfig((p) => ({ ...p, hero_title: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <input value={config.hero_subtitle} onChange={(e) => setConfig((p) => ({ ...p, hero_subtitle: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
            <input value={config.hero_cta_text} onChange={(e) => setConfig((p) => ({ ...p, hero_cta_text: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button URL</label>
            <input value={config.hero_cta_url} onChange={(e) => setConfig((p) => ({ ...p, hero_cta_url: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* Featured Section */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Icon icon="mdi:star-outline" width={18} className="text-yellow-600" />
          Featured Section
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
            <input value={config.featured_section_title} onChange={(e) => setConfig((p) => ({ ...p, featured_section_title: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Featured Phones</label>
            <input type="number" min="1" max="20" value={config.featured_phones_count} onChange={(e) => setConfig((p) => ({ ...p, featured_phones_count: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* Display Options */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Icon icon="mdi:toggle-switch-outline" width={18} className="text-green-600" />
          Display Options
        </h3>
        <div className="space-y-3">
          {[
            { key: "show_latest_reviews", label: "Show Latest Reviews section" },
            { key: "show_latest_articles", label: "Show Latest Articles section" },
            { key: "show_comparison_cta", label: "Show Comparison CTA banner" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={config[key as keyof typeof config] === "true"}
                onChange={(e) => setConfig((p) => ({ ...p, [key]: e.target.checked ? "true" : "false" }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Icon icon="mdi:page-layout-footer" width={18} className="text-gray-600" />
          Footer
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text</label>
          <input value={config.footer_text} onChange={(e) => setConfig((p) => ({ ...p, footer_text: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
    </div>
  );
}
