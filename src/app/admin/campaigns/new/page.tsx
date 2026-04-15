"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Advertiser {
  id: string;
  name: string;
  company: { name: string } | null;
}

interface Phone {
  id: string;
  name: string;
  slug: string;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    advertiserId: "",
    name: "",
    type: "banner" as string,
    pricingModel: "cpm" as string,
    status: "draft" as string,
    budgetTotal: "",
    budgetDaily: "",
    bidAmount: "",
    startDate: "",
    endDate: "",
    priority: "0",
    frequencyCap: "",
    // Targeting
    targetBrands: [] as string[],
    targetDevices: [] as string[],
    targetPageTypes: [] as string[],
    // Creative
    creativeTitle: "",
    creativeDescription: "",
    creativeImage: "",
    creativeClickUrl: "",
    creativePhoneId: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/advertisers").then((r) => r.json()),
      fetch("/api/phones?limit=100").then((r) => r.json()),
    ]).then(([advData, phoneData]) => {
      if (advData.success) setAdvertisers(advData.data);
      if (phoneData.success) setPhones(phoneData.data || []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Build targeting JSON
      const targeting: Record<string, string[]> = {};
      if (form.targetBrands.length > 0) targeting.brands = form.targetBrands;
      if (form.targetDevices.length > 0) targeting.devices = form.targetDevices;
      if (form.targetPageTypes.length > 0) targeting.pageTypes = form.targetPageTypes;

      // Create campaign
      const campaignRes = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advertiserId: form.advertiserId,
          name: form.name,
          type: form.type,
          pricingModel: form.pricingModel,
          status: form.status,
          budgetTotal: form.budgetTotal ? parseFloat(form.budgetTotal) : null,
          budgetDaily: form.budgetDaily ? parseFloat(form.budgetDaily) : null,
          bidAmount: form.bidAmount ? parseFloat(form.bidAmount) : null,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          priority: parseInt(form.priority),
          frequencyCap: form.frequencyCap ? parseInt(form.frequencyCap) : null,
          targeting: Object.keys(targeting).length > 0 ? JSON.stringify(targeting) : null,
        }),
      });

      const campaignData = await campaignRes.json();
      if (!campaignData.success) {
        setError(campaignData.error || "Failed to create campaign");
        setLoading(false);
        return;
      }

      // Create creative if provided
      if (form.creativeTitle || form.creativeImage || form.creativeClickUrl) {
        await fetch("/api/admin/creatives", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaignId: campaignData.data.id,
            title: form.creativeTitle || null,
            description: form.creativeDescription || null,
            image: form.creativeImage || null,
            clickUrl: form.creativeClickUrl || null,
            phoneId: form.creativePhoneId || null,
          }),
        });
      }

      router.push("/admin/campaigns");
    } catch {
      setError("Failed to create campaign");
    }
    setLoading(false);
  };

  const campaignTypes = [
    { value: "banner", label: "Banner Ad", desc: "Standard display banner" },
    { value: "sponsored_product", label: "Sponsored Product", desc: "Promoted phone listing" },
    { value: "native", label: "Native Ad", desc: "Blends with content" },
    { value: "brand_spotlight", label: "Brand Spotlight", desc: "Premium brand placement" },
  ];

  const pricingModels = [
    { value: "cpm", label: "CPM", desc: "Cost per 1,000 impressions" },
    { value: "cpc", label: "CPC", desc: "Cost per click" },
    { value: "flat", label: "Flat Rate", desc: "Fixed price per period" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Campaign</h1>
          <p className="text-sm text-gray-500 mt-1">Set up a new advertising campaign with targeting and creatives</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to Campaigns
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Campaign Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Samsung Galaxy S24 Launch"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Advertiser *</label>
              <select
                value={form.advertiserId}
                onChange={(e) => setForm({ ...form, advertiserId: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Advertiser</option>
                {advertisers.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}{a.company ? ` (${a.company.name})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
              <div className="space-y-2">
                {campaignTypes.map((t) => (
                  <label key={t.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.type === t.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                    <input
                      type="radio"
                      name="type"
                      value={t.value}
                      checked={form.type === t.value}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="text-blue-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.label}</p>
                      <p className="text-xs text-gray-500">{t.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Model</label>
              <div className="space-y-2">
                {pricingModels.map((m) => (
                  <label key={m.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.pricingModel === m.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                    <input
                      type="radio"
                      name="pricingModel"
                      value={m.value}
                      checked={form.pricingModel === m.value}
                      onChange={(e) => setForm({ ...form, pricingModel: e.target.value })}
                      className="text-blue-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.label}</p>
                      <p className="text-xs text-gray-500">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Budget & Schedule */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Budget & Schedule</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.budgetTotal}
                onChange={(e) => setForm({ ...form, budgetTotal: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="e.g., 5000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Daily Budget ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.budgetDaily}
                onChange={(e) => setForm({ ...form, budgetDaily: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="e.g., 100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bid Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.bidAmount}
                onChange={(e) => setForm({ ...form, bidAmount: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder={form.pricingModel === "cpm" ? "e.g., 5.00 per 1k" : "e.g., 0.50 per click"}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency Cap (per day)</label>
              <input
                type="number"
                value={form.frequencyCap}
                onChange={(e) => setForm({ ...form, frequencyCap: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="e.g., 3"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority (0-100)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Priority: {form.priority} — Higher priority ads are served first</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="draft">Draft — Not serving</option>
                <option value="active">Active — Serving immediately</option>
                <option value="paused">Paused — Temporarily stopped</option>
              </select>
            </div>
          </div>
        </div>

        {/* Targeting */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Targeting</h2>
          <p className="text-sm text-gray-500">Leave empty to target all traffic. Specify filters to narrow delivery.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Device Types</label>
              <div className="space-y-1">
                {["desktop", "mobile", "tablet"].map((d) => (
                  <label key={d} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.targetDevices.includes(d)}
                      onChange={(e) => {
                        setForm({
                          ...form,
                          targetDevices: e.target.checked
                            ? [...form.targetDevices, d]
                            : form.targetDevices.filter((x) => x !== d),
                        });
                      }}
                      className="rounded text-blue-600"
                    />
                    <span className="capitalize">{d}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Page Types</label>
              <div className="space-y-1">
                {["homepage", "phone_detail", "brand_page", "search_results", "comparison", "news"].map((p) => (
                  <label key={p} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.targetPageTypes.includes(p)}
                      onChange={(e) => {
                        setForm({
                          ...form,
                          targetPageTypes: e.target.checked
                            ? [...form.targetPageTypes, p]
                            : form.targetPageTypes.filter((x) => x !== p),
                        });
                      }}
                      className="rounded text-blue-600"
                    />
                    <span className="capitalize">{p.replace("_", " ")}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Creative */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Ad Creative</h2>
          <p className="text-sm text-gray-500">Add the first creative for this campaign. You can add more later.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
              <input
                type="text"
                value={form.creativeTitle}
                onChange={(e) => setForm({ ...form, creativeTitle: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="e.g., Discover the New Galaxy S24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Click URL</label>
              <input
                type="url"
                value={form.creativeClickUrl}
                onChange={(e) => setForm({ ...form, creativeClickUrl: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.creativeDescription}
              onChange={(e) => setForm({ ...form, creativeDescription: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={2}
              placeholder="Short description for native/sponsored ads"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={form.creativeImage}
                onChange={(e) => setForm({ ...form, creativeImage: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link to Phone (optional)</label>
              <select
                value={form.creativePhoneId}
                onChange={(e) => setForm({ ...form, creativePhoneId: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">None — External link only</option>
                {phones.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Campaign"}
          </button>
        </div>
      </form>
    </div>
  );
}
