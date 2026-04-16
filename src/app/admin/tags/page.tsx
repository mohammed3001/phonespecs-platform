"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";

interface Tag {
  id: string;
  name: string;
  slug: string;
  articleCount: number;
  createdAt: string;
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", slug: "" });

  const fetchTags = () => {
    setLoading(true);
    fetch("/api/admin/tags")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTags(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchTags(); }, []);

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const resetForm = () => {
    setForm({ name: "", slug: "" });
    setEditing(null);
    setShowForm(false);
    setError("");
  };

  const startEdit = (tag: Tag) => {
    setForm({ name: tag.name, slug: tag.slug });
    setEditing(tag);
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const slug = form.slug || generateSlug(form.name);

    try {
      const res = await fetch("/api/admin/tags", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: editing.id, name: form.name, slug } : { name: form.name, slug }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
        setSaving(false);
        return;
      }
      resetForm();
      fetchTags();
    } catch {
      setError("Network error");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete tag "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/tags?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) {
        alert(data.error);
        return;
      }
      fetchTags();
    } catch {
      alert("Network error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tags</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{tags.length} tags</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <Icon icon="mdi:plus" width={18} />
          Add Tag
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm dark:shadow-gray-900/30 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editing ? "Edit Tag" : "New Tag"}</h3>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    name,
                    slug: !editing && (!prev.slug || prev.slug === generateSlug(prev.name)) ? generateSlug(name) : prev.slug,
                  }));
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 5G"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Slug *</label>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 5g"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : editing ? "Save Changes" : "Create Tag"}
            </button>
            <button type="button" onClick={resetForm} className="text-gray-600 dark:text-gray-300 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-3">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse" />
          ))
        ) : tags.length === 0 ? (
          <div className="w-full bg-white dark:bg-gray-800 rounded-xl border p-12 text-center">
            <Icon icon="mdi:tag-outline" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tags yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create tags to organize your articles</p>
          </div>
        ) : (
          tags.map((tag) => (
            <div
              key={tag.id}
              className="bg-white dark:bg-gray-800 rounded-lg border px-4 py-2.5 flex items-center gap-3 hover:shadow-sm dark:shadow-gray-900/30 transition-shadow group"
            >
              <Icon icon="mdi:tag-outline" width={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{tag.name}</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{tag.articleCount}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(tag)} className="text-blue-600 hover:text-blue-800 p-1">
                  <Icon icon="mdi:pencil-outline" width={14} />
                </button>
                <button onClick={() => handleDelete(tag.id, tag.name)} className="text-red-500 hover:text-red-700 p-1">
                  <Icon icon="mdi:delete-outline" width={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
