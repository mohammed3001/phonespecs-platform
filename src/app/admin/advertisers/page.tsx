"use client";

import { useEffect, useState } from "react";

interface Advertiser {
  id: string;
  name: string;
  email: string | null;
  contactPerson: string | null;
  balance: number;
  isActive: boolean;
  company: { name: string; logo: string | null } | null;
  _count: { campaigns: number };
  createdAt: string;
}

export default function AdminAdvertisersPage() {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", contactPerson: "", balance: "" });
  const [saving, setSaving] = useState(false);

  const fetchAdvertisers = () => {
    fetch("/api/admin/advertisers")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setAdvertisers(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdvertisers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/admin/advertisers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email || null,
        contactPerson: form.contactPerson || null,
        balance: form.balance ? parseFloat(form.balance) : 0,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setShowForm(false);
      setForm({ name: "", email: "", contactPerson: "", balance: "" });
      fetchAdvertisers();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advertisers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage advertising accounts and balances</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Advertiser
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Advertisers</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{advertisers.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{advertisers.filter((a) => a.isActive).length}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Balance</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ${advertisers.reduce((sum, a) => sum + a.balance, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">New Advertiser</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="e.g., Samsung Electronics"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="ads@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
              <input
                type="text"
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Balance ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.balance}
                onChange={(e) => setForm({ ...form, balance: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Advertiser"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Advertisers Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Advertiser</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Campaigns</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    ))}
                  </tr>
                ))
              ) : advertisers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-gray-500 font-medium">No advertisers yet</p>
                    <p className="text-gray-400 text-sm mt-1">Add your first advertiser to start creating campaigns</p>
                  </td>
                </tr>
              ) : (
                advertisers.map((adv) => (
                  <tr key={adv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-sm">{adv.name}</p>
                      <p className="text-xs text-gray-400">Since {new Date(adv.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">{adv.email || "—"}</p>
                      {adv.contactPerson && (
                        <p className="text-xs text-gray-400">{adv.contactPerson}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {adv.company?.name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">{adv._count.campaigns}</span>
                      <span className="text-xs text-gray-400 ml-1">campaign{adv._count.campaigns !== 1 ? "s" : ""}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${adv.balance > 0 ? "text-green-600" : "text-gray-400"}`}>
                        ${adv.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`w-2.5 h-2.5 rounded-full inline-block ${adv.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
