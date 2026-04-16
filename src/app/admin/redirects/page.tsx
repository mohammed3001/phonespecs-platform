"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";

interface Redirect {
  id: string;
  sourcePath: string;
  targetPath: string;
  type: number;
  isActive: boolean;
  hitCount: number;
  createdAt: string;
}

const emptyRedirect = { sourcePath: "", targetPath: "", type: 301, isActive: true };

export default function AdminRedirectsPage() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyRedirect);
  const [saving, setSaving] = useState(false);

  const fetchRedirects = () => {
    setLoading(true);
    fetch("/api/admin/redirects")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setRedirects(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchRedirects(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sourcePath || !form.targetPath) return;
    setSaving(true);

    const method = editingId ? "PUT" : "POST";
    const payload = editingId ? { ...form, id: editingId } : form;

    try {
      const res = await fetch("/api/admin/redirects", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyRedirect);
        fetchRedirects();
      } else {
        alert(data.error);
      }
    } catch { alert("Network error"); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this redirect?")) return;
    try {
      const res = await fetch(`/api/admin/redirects?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchRedirects();
      else alert(data.error);
    } catch { alert("Network error"); }
  };

  const toggleActive = async (redirect: Redirect) => {
    try {
      const res = await fetch("/api/admin/redirects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: redirect.id, isActive: !redirect.isActive }),
      });
      const data = await res.json();
      if (data.success) fetchRedirects();
    } catch { /* ignore */ }
  };

  const startEdit = (r: Redirect) => {
    setEditingId(r.id);
    setForm({ sourcePath: r.sourcePath, targetPath: r.targetPath, type: r.type, isActive: r.isActive });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Redirects</h1>
          <p className="text-sm text-gray-500 mt-0.5">{redirects.length} redirects configured</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyRedirect); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <Icon icon="mdi:plus" width={18} /> Add Redirect
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">{editingId ? "Edit Redirect" : "New Redirect"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source Path *</label>
              <input required value={form.sourcePath} onChange={(e) => setForm((p) => ({ ...p, sourcePath: e.target.value }))}
                placeholder="/old-path" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Path *</label>
              <input required value={form.targetPath} onChange={(e) => setForm((p) => ({ ...p, targetPath: e.target.value }))}
                placeholder="/new-path" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value={301}>301 (Permanent)</option>
                <option value={302}>302 (Temporary)</option>
                <option value={307}>307 (Temporary Preserve)</option>
                <option value={308}>308 (Permanent Preserve)</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 pb-2">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-600 px-4 py-2 text-sm hover:bg-gray-100 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl border p-4 animate-pulse"><div className="h-5 bg-gray-200 rounded w-64" /></div>)}</div>
      ) : redirects.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Icon icon="mdi:swap-horizontal" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No redirects configured</h3>
          <p className="text-sm text-gray-500">Add URL redirects to manage old or changed paths</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="text-center px-2 py-3 text-xs font-medium text-gray-500">→</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Hits</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {redirects.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{r.sourcePath}</td>
                  <td className="px-2 py-3 text-center text-gray-400">→</td>
                  <td className="px-4 py-3 text-sm font-mono text-blue-600">{r.targetPath}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">{r.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(r)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${r.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {r.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.hitCount}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => startEdit(r)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                    <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
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
