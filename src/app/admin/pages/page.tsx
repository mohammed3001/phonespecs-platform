"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/shared/Icon";

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  template: string;
  status: string;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

const emptyPage = { title: "", slug: "", content: "", template: "default", status: "draft", metaTitle: "", metaDescription: "" };

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyPage);
  const [saving, setSaving] = useState(false);

  const fetchPages = () => {
    setLoading(true);
    fetch("/api/admin/pages")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setPages(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchPages(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    setSaving(true);

    const method = editingId ? "PUT" : "POST";
    const payload = editingId ? { ...form, id: editingId } : form;

    try {
      const res = await fetch("/api/admin/pages", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyPage);
        fetchPages();
      } else {
        alert(data.error);
      }
    } catch { alert("Network error"); }
    setSaving(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete page "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/pages?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchPages();
      else alert(data.error);
    } catch { alert("Network error"); }
  };

  const startEdit = (page: Page) => {
    setEditingId(page.id);
    setForm({
      title: page.title, slug: page.slug, content: page.content || "",
      template: page.template, status: page.status,
      metaTitle: page.metaTitle || "", metaDescription: page.metaDescription || "",
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pages</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{pages.length} pages</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyPage); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <Icon icon="mdi:plus" width={18} /> New Page
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{editingId ? "Edit Page" : "New Page"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Title *</label>
              <input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Slug</label>
              <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="Auto-generated" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Template</label>
              <select value={form.template} onChange={(e) => setForm((p) => ({ ...p, template: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="default">Default</option>
                <option value="full-width">Full Width</option>
                <option value="sidebar">With Sidebar</option>
                <option value="landing">Landing Page</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Content</label>
            <textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              rows={8} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Meta Title</label>
              <input value={form.metaTitle} onChange={(e) => setForm((p) => ({ ...p, metaTitle: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Meta Description</label>
              <input value={form.metaDescription} onChange={(e) => setForm((p) => ({ ...p, metaDescription: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-600 dark:text-gray-300 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border p-4 animate-pulse"><div className="h-5 bg-gray-200 rounded w-48" /></div>)}</div>
      ) : pages.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-12 text-center">
          <Icon icon="mdi:file-document-outline" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No pages yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create CMS pages for your site (About, Terms, etc.)</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Template</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Updated</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{page.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    <Link href={`/${page.slug}`} target="_blank" className="text-blue-600 hover:text-blue-800">/{page.slug}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 capitalize">{page.template}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${page.status === "published" ? "bg-green-100 dark:bg-green-900/30 text-green-700" : "bg-gray-100 text-gray-600 dark:text-gray-300"}`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(page.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => startEdit(page)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                    <button onClick={() => handleDelete(page.id, page.title)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
