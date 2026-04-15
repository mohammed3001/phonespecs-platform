"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  status: string;
  type: string;
  pricingModel: string;
  spentTotal: number;
  budgetTotal: number | null;
  budgetDaily: number | null;
  startDate: string | null;
  endDate: string | null;
  advertiser: { name: string };
  _count: { creatives: number; impressions: number; clicks: number };
}

export default function CompanyCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/company/portal?section=campaigns")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCampaigns(res.data.campaigns);
        else setError(res.error);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  }, []);

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    active: "bg-green-100 text-green-700",
    paused: "bg-yellow-100 text-yellow-700",
    completed: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link href="/company/dashboard" className="text-lg font-bold">
                <span className="text-blue-600">Mobile</span>Platform
              </Link>
              <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">BRAND PORTAL</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/company/dashboard" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Dashboard</Link>
              <Link href="/company/campaigns" className="text-sm text-gray-900 font-semibold">Campaigns</Link>
              <Link href="/company/analytics" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Analytics</Link>
            </nav>
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">View Site</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Campaigns</h1>
            <p className="text-sm text-gray-500 mt-1">View your advertising campaigns and their performance</p>
          </div>
          <Link href="/company/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</Link>
        </div>

        {error ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <p className="text-gray-500 font-medium">{error}</p>
            <Link href="/login?callbackUrl=/company/campaigns" className="text-blue-600 text-sm font-medium mt-2 inline-block">Sign In →</Link>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <p className="text-gray-500 font-medium">No campaigns yet</p>
            <p className="text-gray-400 text-sm mt-1">Contact your account manager to set up your first advertising campaign</p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const ctr = campaign._count.impressions > 0
                ? ((campaign._count.clicks / campaign._count.impressions) * 100).toFixed(2)
                : "0.00";
              const budgetUsage = campaign.budgetTotal
                ? Math.min(100, (campaign.spentTotal / campaign.budgetTotal) * 100)
                : 0;

              return (
                <div key={campaign.id} className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[campaign.status] || ""}`}>
                          {campaign.status}
                        </span>
                        <span className="text-xs text-gray-400 capitalize">{campaign.type.replace("_", " ")}</span>
                        <span className="text-xs text-gray-400 uppercase">{campaign.pricingModel}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {campaign.budgetTotal && (
                        <div>
                          <p className="text-xs text-gray-500">Budget Usage</p>
                          <div className="w-32 h-2 bg-gray-100 rounded-full mt-1">
                            <div
                              className={`h-full rounded-full transition-all ${budgetUsage > 90 ? "bg-red-500" : budgetUsage > 70 ? "bg-yellow-500" : "bg-green-500"}`}
                              style={{ width: `${budgetUsage}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{budgetUsage.toFixed(0)}% used</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Impressions</p>
                      <p className="text-lg font-semibold text-gray-900">{campaign._count.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Clicks</p>
                      <p className="text-lg font-semibold text-gray-900">{campaign._count.clicks.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">CTR</p>
                      <p className="text-lg font-semibold text-blue-600">{ctr}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Spent</p>
                      <p className="text-lg font-semibold text-gray-900">${campaign.spentTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Budget</p>
                      <p className="text-lg font-semibold text-gray-900">{campaign.budgetTotal ? `$${campaign.budgetTotal.toLocaleString()}` : "—"}</p>
                    </div>
                  </div>

                  {(campaign.startDate || campaign.endDate) && (
                    <div className="mt-3 pt-3 border-t flex gap-4 text-xs text-gray-400">
                      {campaign.startDate && <span>Start: {campaign.startDate}</span>}
                      {campaign.endDate && <span>End: {campaign.endDate}</span>}
                      <span>{campaign._count.creatives} creative{campaign._count.creatives !== 1 ? "s" : ""}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
