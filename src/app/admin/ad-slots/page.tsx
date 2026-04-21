"use client";

import { useEffect, useState } from "react";

interface AdSlot {
  id: string;
  name: string;
  slug: string;
  pageType: string;
  position: string;
  dimensions: string | null;
  isActive: boolean;
  fallbackHtml: string | null;
  sortOrder: number;
  _count: { impressions: number; clicks: number };
}

export default function AdminAdSlotsPage() {
  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    pageType: "phone_detail",
    position: "sidebar",
    dimensions: "",
    fallbackHtml: "",
    sortOrder: "0",
  });
  const [saving, setSaving] = useState(false);

  const fetchSlots = () => {
    fetch("/api/admin/ad-slots")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSlots(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/admin/ad-slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        slug: form.slug,
        pageType: form.pageType,
        position: form.position,
        dimensions: form.dimensions || null,
        fallbackHtml: form.fallbackHtml || null,
        sortOrder: parseInt(form.sortOrder),
      }),
    });

    const data = await res.json();
    if (data.success) {
      setShowForm(false);
      setForm({ name: "", slug: "", pageType: "phone_detail", position: "sidebar", dimensions: "", fallbackHtml: "", sortOrder: "0" });
      fetchSlots();
    }
    setSaving(false);
  };

  const toggleActive = async (slotId: string) => {
    await fetch("/api/admin/ad-slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggleActive", slotId }),
    });
    fetchSlots();
  };

  const pageTypes = ["homepage", "phone_detail", "phone_listing", "brand_page", "search_results", "comparison", "news", "category"];
  const positions = ["header", "sidebar", "inline_content", "below_specs", "footer", "between_results"];

  // Group slots by page type
  const grouped: Record<string, AdSlot[]> = {};
  for (const slot of slots) {
    if (!grouped[slot.pageType]) grouped[slot.pageType] = [];
    grouped[slot.pageType].push(slot);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ad Slots</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage advertising placement zones across the site. {slots.length} slot{slots.length !== 1 ? "s" : ""} configured.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Slot
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Ad Slot</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                  setForm({ ...form, name, slug });
                }}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="e.g., Phone Detail Sidebar"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Slug *</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Page Type *</label>
              <select
                value={form.pageType}
                onChange={(e) => setForm({ ...form, pageType: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                {pageTypes.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Position *</label>
              <select
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                {positions.map((p) => (
                  <option key={p} value={p}>{p.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Dimensions</label>
              <input
                type="text"
                value={form.dimensions}
                onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="e.g., 300x250, 728x90"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Fallback HTML</label>
            <textarea
              value={form.fallbackHtml}
              onChange={(e) => setForm({ ...form, fallbackHtml: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
              rows={3}
              placeholder="HTML to show when no ad is available"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Creating..." : "Create Slot"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-700/50">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Slots grouped by page type */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border p-8 text-center text-gray-400">Loading slots...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 font-medium">No ad slots configured</p>
          <p className="text-gray-400 text-sm mt-1">Create your first slot to define where ads can appear</p>
        </div>
      ) : (
        Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([pageType, pageSlots]) => (
          <div key={pageType} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 font-medium capitalize">
                {pageType.replace(/_/g, " ")}
              </span>
              <span className="text-xs text-gray-400">{pageSlots.length} slot{pageSlots.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="divide-y">
              {pageSlots.map((slot) => (
                <div key={slot.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{slot.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{slot.slug}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 dark:text-gray-300 rounded capitalize">
                      {slot.position.replace(/_/g, " ")}
                    </span>
                    {slot.dimensions && (
                      <span className="text-xs text-gray-400">{slot.dimensions}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                      <p>{slot._count.impressions.toLocaleString()} impr.</p>
                      <p>{slot._count.clicks.toLocaleString()} clicks</p>
                    </div>
                    <button
                      onClick={() => toggleActive(slot.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        slot.isActive ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white dark:bg-gray-800 transition-transform ${
                        slot.isActive ? "translate-x-4" : "translate-x-1"
                      }`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
