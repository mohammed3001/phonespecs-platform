"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  type: string;
  pricingModel: string;
  status: string;
  budgetTotal: number | null;
  budgetDaily: number | null;
  spentTotal: number;
  bidAmount: number | null;
  startDate: string | null;
  endDate: string | null;
  priority: number;
  advertiser: { name: string; company: { name: string } | null };
  _count: { creatives: number; impressions: number; clicks: number };
}

interface CampaignStats {
  [status: string]: { count: number; spent: number; budget: number };
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CampaignStats>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<Record<string, { totals: { impressions: number; clicks: number; spent: number; ctr: number } }>>({});

  const fetchCampaigns = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/admin/campaigns?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setCampaigns(data.data);
          setStats(data.stats || {});
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter]);

  const updateStatus = async (campaignId: string, newStatus: string) => {
    const res = await fetch("/api/admin/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateStatus", campaignId, status: newStatus }),
    });
    const data = await res.json();
    if (data.success) fetchCampaigns();
  };

  const loadAnalytics = async (campaignId: string) => {
    if (analytics[campaignId]) {
      setExpandedId(expandedId === campaignId ? null : campaignId);
      return;
    }

    const res = await fetch("/api/admin/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "analytics", campaignId }),
    });
    const data = await res.json();
    if (data.success) {
      setAnalytics({ ...analytics, [campaignId]: data.data });
      setExpandedId(campaignId);
    }
  };

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600 dark:text-gray-300",
    active: "bg-green-100 dark:bg-green-900/30 text-green-700",
    paused: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700",
    completed: "bg-blue-100 dark:bg-blue-900/30 text-blue-700",
    archived: "bg-red-100 dark:bg-red-900/30 text-red-700",
  };

  const totalCampaigns = Object.values(stats).reduce((sum, s) => sum + s.count, 0);
  const totalSpent = Object.values(stats).reduce((sum, s) => sum + s.spent, 0);
  const totalBudget = Object.values(stats).reduce((sum, s) => sum + s.budget, 0);
  const activeCampaigns = stats["active"]?.count || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage advertising campaigns, budgets, and performance</p>
        </div>
        <Link
          href="/admin/campaigns/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Campaign
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Campaigns</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalCampaigns}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeCampaigns}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Spent</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Budget</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["", "draft", "active", "paused", "completed", "archived"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            {s || "All"} {s && stats[s] ? `(${stats[s].count})` : ""}
          </button>
        ))}
      </div>

      {/* Campaigns Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Campaign</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Advertiser</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Budget</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Spent</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Performance</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(8)].map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    ))}
                  </tr>
                ))
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No campaigns yet</p>
                    <p className="text-gray-400 text-sm mt-1">Create your first advertising campaign to get started</p>
                    <Link href="/admin/campaigns/new" className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Create Campaign →
                    </Link>
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => {
                  const ctr = campaign._count.impressions > 0
                    ? ((campaign._count.clicks / campaign._count.impressions) * 100).toFixed(2)
                    : "0.00";
                  const budgetUsage = campaign.budgetTotal
                    ? Math.min(100, (campaign.spentTotal / campaign.budgetTotal) * 100)
                    : 0;

                  return (
                    <>
                      <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{campaign.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {campaign._count.creatives} creative{campaign._count.creatives !== 1 ? "s" : ""}
                            {campaign.startDate && ` · ${campaign.startDate}`}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700 dark:text-gray-200">{campaign.advertiser.name}</p>
                          {campaign.advertiser.company && (
                            <p className="text-xs text-gray-400">{campaign.advertiser.company.name}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 font-medium">
                            {campaign.type.replace("_", " ")}
                          </span>
                          <span className="text-xs text-gray-400 block mt-0.5 uppercase">{campaign.pricingModel}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[campaign.status] || ""}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700 dark:text-gray-200">
                            {campaign.budgetTotal ? `$${campaign.budgetTotal.toLocaleString()}` : "—"}
                          </p>
                          {campaign.budgetTotal && (
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1">
                              <div
                                className={`h-full rounded-full ${budgetUsage > 90 ? "bg-red-500" : budgetUsage > 70 ? "bg-yellow-500" : "bg-green-500"}`}
                                style={{ width: `${budgetUsage}%` }}
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                          ${campaign.spentTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs space-y-0.5">
                            <p className="text-gray-700 dark:text-gray-200">{campaign._count.impressions.toLocaleString()} impr.</p>
                            <p className="text-gray-700 dark:text-gray-200">{campaign._count.clicks.toLocaleString()} clicks</p>
                            <p className="text-blue-600 font-medium">{ctr}% CTR</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right space-y-1">
                          <div className="flex flex-col items-end gap-1">
                            <button
                              onClick={() => loadAnalytics(campaign.id)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              {expandedId === campaign.id ? "Hide" : "Analytics"}
                            </button>
                            {campaign.status === "draft" && (
                              <button
                                onClick={() => updateStatus(campaign.id, "active")}
                                className="text-green-600 hover:text-green-800 text-xs font-medium"
                              >
                                Activate
                              </button>
                            )}
                            {campaign.status === "active" && (
                              <button
                                onClick={() => updateStatus(campaign.id, "paused")}
                                className="text-yellow-600 hover:text-yellow-800 text-xs font-medium"
                              >
                                Pause
                              </button>
                            )}
                            {campaign.status === "paused" && (
                              <button
                                onClick={() => updateStatus(campaign.id, "active")}
                                className="text-green-600 hover:text-green-800 text-xs font-medium"
                              >
                                Resume
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {/* Analytics Expansion */}
                      {expandedId === campaign.id && analytics[campaign.id] && (
                        <tr key={`${campaign.id}-analytics`}>
                          <td colSpan={8} className="px-4 py-4 bg-gray-50 dark:bg-gray-900 border-t">
                            <div className="grid grid-cols-4 gap-4">
                              <div className="bg-white dark:bg-gray-800 rounded-lg border p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Impressions</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                  {analytics[campaign.id].totals.impressions.toLocaleString()}
                                </p>
                              </div>
                              <div className="bg-white dark:bg-gray-800 rounded-lg border p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Clicks</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                  {analytics[campaign.id].totals.clicks.toLocaleString()}
                                </p>
                              </div>
                              <div className="bg-white dark:bg-gray-800 rounded-lg border p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">CTR</p>
                                <p className="text-lg font-bold text-blue-600">
                                  {analytics[campaign.id].totals.ctr}%
                                </p>
                              </div>
                              <div className="bg-white dark:bg-gray-800 rounded-lg border p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                  ${analytics[campaign.id].totals.spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
