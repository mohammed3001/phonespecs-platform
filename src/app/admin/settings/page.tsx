"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";

interface Setting {
  id: string;
  key: string;
  value: string;
  group: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newSetting, setNewSetting] = useState({ key: "", value: "", group: "general" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const fetchSettings = () => {
    setLoading(true);
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.data);
          const vals: Record<string, string> = {};
          data.data.forEach((s: Setting) => { vals[s.key] = s.value; });
          setEditValues(vals);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    const settingsToSave = Object.entries(editValues).map(([key, value]) => {
      const existing = settings.find((s) => s.key === key);
      return { key, value, group: existing?.group || "general" };
    });

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsToSave }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Settings saved successfully");
        fetchSettings();
      } else {
        setError(data.error);
      }
    } catch {
      setError("Network error");
    }
    setSaving(false);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleAddSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSetting.key) return;

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSetting),
      });
      const data = await res.json();
      if (data.success) {
        setNewSetting({ key: "", value: "", group: "general" });
        setShowAdd(false);
        fetchSettings();
      } else {
        setError(data.error);
      }
    } catch {
      setError("Network error");
    }
  };

  const handleDeleteSetting = async (key: string) => {
    if (!confirm(`Delete setting "${key}"?`)) return;
    try {
      const res = await fetch(`/api/admin/settings?key=${encodeURIComponent(key)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchSettings();
      else alert(data.error);
    } catch { alert("Network error"); }
  };

  // Group settings by group
  const grouped: Record<string, Setting[]> = {};
  settings.forEach((s) => {
    if (!grouped[s.group]) grouped[s.group] = [];
    grouped[s.group].push(s);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage platform configuration</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdd(true)}
            className="bg-gray-100 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-2"
          >
            <Icon icon="mdi:plus" width={18} />
            Add Setting
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Icon icon="mdi:loading" className="animate-spin" width={16} />}
            {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

      {showAdd && (
        <form onSubmit={handleAddSetting} className="bg-white dark:bg-gray-800 rounded-xl border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">New Setting</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Key *</label>
              <input required value={newSetting.key} onChange={(e) => setNewSetting((p) => ({ ...p, key: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="site_name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Value</label>
              <input value={newSetting.value} onChange={(e) => setNewSetting((p) => ({ ...p, value: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Group</label>
              <select value={newSetting.group} onChange={(e) => setNewSetting((p) => ({ ...p, group: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="general">General</option>
                <option value="seo">SEO</option>
                <option value="social">Social</option>
                <option value="email">Email</option>
                <option value="analytics">Analytics</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Create</button>
            <button type="button" onClick={() => setShowAdd(false)} className="text-gray-600 dark:text-gray-300 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border p-6 animate-pulse space-y-3">
              <div className="h-5 bg-gray-200 rounded w-32" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-12 text-center">
          <Icon icon="mdi:cog-outline" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No settings configured</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Click &quot;Add Setting&quot; to create your first configuration.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([group, items]) => (
          <div key={group} className="bg-white dark:bg-gray-800 rounded-xl border">
            <div className="px-5 py-4 border-b bg-gray-50 dark:bg-gray-900 rounded-t-xl">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{group}</h3>
            </div>
            <div className="divide-y">
              {items.map((setting) => (
                <div key={setting.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="w-48 flex-shrink-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{setting.key}</p>
                    <p className="text-xs text-gray-400">{setting.group}</p>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={editValues[setting.key] ?? setting.value}
                      onChange={(e) => setEditValues((p) => ({ ...p, [setting.key]: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button onClick={() => handleDeleteSetting(setting.key)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0">
                    <Icon icon="mdi:delete-outline" width={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
