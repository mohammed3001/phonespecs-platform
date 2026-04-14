"use client";

import { useEffect, useState } from "react";

interface Settings {
  [key: string]: unknown;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSettings(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (key: string, value: unknown) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value, group: "general" }),
      });
      const data = await res.json();
      if (data.success) {
        setSettings((prev) => ({ ...prev, [key]: value }));
        setMessage("Settings saved successfully");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch {
      setMessage("Failed to save settings");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <div className="bg-white rounded-xl border p-6 animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const settingGroups = [
    {
      title: "General",
      items: [
        { key: "site_name", label: "Site Name", type: "text" },
        { key: "site_tagline", label: "Tagline", type: "text" },
        { key: "contact_email", label: "Contact Email", type: "email" },
      ],
    },
    {
      title: "Appearance",
      items: [
        { key: "primary_color", label: "Primary Color", type: "color" },
        { key: "site_logo", label: "Logo URL", type: "text" },
        { key: "site_favicon", label: "Favicon URL", type: "text" },
      ],
    },
    {
      title: "Homepage",
      items: [
        { key: "homepage_featured_count", label: "Featured Phones Count", type: "number" },
        { key: "homepage_latest_count", label: "Latest Phones Count", type: "number" },
      ],
    },
    {
      title: "Search",
      items: [
        { key: "search_results_per_page", label: "Results Per Page", type: "number" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        {message && (
          <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">{message}</span>
        )}
      </div>

      <div className="space-y-6">
        {settingGroups.map((group) => (
          <div key={group.title} className="bg-white rounded-xl shadow-sm border">
            <div className="p-5 border-b">
              <h2 className="text-lg font-semibold text-gray-900">{group.title}</h2>
            </div>
            <div className="p-5 space-y-4">
              {group.items.map((item) => (
                <div key={item.key} className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 sm:w-48 flex-shrink-0">
                    {item.label}
                  </label>
                  <div className="flex-1 flex gap-2">
                    <input
                      type={item.type}
                      value={String(settings[item.key] || "")}
                      onChange={(e) => setSettings((prev) => ({
                        ...prev,
                        [item.key]: item.type === "number" ? parseInt(e.target.value) || 0 : e.target.value,
                      }))}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleSave(item.key, settings[item.key])}
                      disabled={saving}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
