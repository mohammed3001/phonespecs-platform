"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PortalData {
  company: { id: string; name: string; slug: string; logo: string | null; isVerified: boolean };
  stats: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalImpressions: number;
    totalClicks: number;
    totalSpent: number;
    ctr: number;
  };
  recentCampaigns: Array<{
    id: string;
    name: string;
    status: string;
    type: string;
    spentTotal: number;
    budgetTotal: number | null;
    impressions: number;
    clicks: number;
  }>;
}

export default function CompanyDashboardPage() {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/company/portal?section=overview")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.error || "Failed to load dashboard");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to connect to server");
        setLoading(false);
      });
  }, []);

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    active: "bg-green-100 text-green-700",
    paused: "bg-yellow-100 text-yellow-700",
    completed: "bg-blue-100 text-blue-700",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CompanyHeader />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CompanyHeader />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-2xl border p-12">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Required</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <Link
              href="/login?callbackUrl=/company/dashboard"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <CompanyHeader companyName={data.company.name} isVerified={data.company.isVerified} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {data.company.name}
            {data.company.isVerified && (
              <svg className="w-5 h-5 inline-block ml-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            )}
          </h1>
          <p className="text-gray-500 mt-1">Your advertising dashboard and campaign management center</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total Campaigns" value={data.stats.totalCampaigns.toString()} />
          <StatCard label="Active" value={data.stats.activeCampaigns.toString()} color="green" />
          <StatCard label="Impressions" value={formatNumber(data.stats.totalImpressions)} />
          <StatCard label="Clicks" value={formatNumber(data.stats.totalClicks)} />
          <StatCard label="CTR" value={`${data.stats.ctr}%`} color="blue" />
          <StatCard label="Total Spent" value={`$${data.stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/company/campaigns"
            className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">My Campaigns</p>
                <p className="text-xs text-gray-500">View and manage all campaigns</p>
              </div>
            </div>
          </Link>

          <Link
            href="/company/analytics"
            className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Analytics</p>
                <p className="text-xs text-gray-500">Performance reports and trends</p>
              </div>
            </div>
          </Link>

          <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl p-5 text-white">
            <p className="font-semibold">Need Help?</p>
            <p className="text-sm text-blue-100 mt-1">Contact your account manager for campaign optimization tips.</p>
            <Link href="/contact" className="text-xs font-medium underline mt-2 inline-block">
              Contact Support →
            </Link>
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
            <Link href="/company/campaigns" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>

          {data.recentCampaigns.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 font-medium">No campaigns yet</p>
              <p className="text-gray-400 text-sm mt-1">Contact your account manager to create your first campaign</p>
            </div>
          ) : (
            <div className="divide-y">
              {data.recentCampaigns.map((campaign) => {
                const ctr = campaign.impressions > 0
                  ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
                  : "0.00";

                return (
                  <div key={campaign.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{campaign.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[campaign.status] || ""}`}>
                            {campaign.status}
                          </span>
                          <span className="text-xs text-gray-400 capitalize">{campaign.type.replace("_", " ")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 text-sm">
                      <div className="text-right">
                        <p className="text-gray-500 text-xs">Impressions</p>
                        <p className="font-medium text-gray-900">{campaign.impressions.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-xs">Clicks</p>
                        <p className="font-medium text-gray-900">{campaign.clicks.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-xs">CTR</p>
                        <p className="font-medium text-blue-600">{ctr}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-xs">Spent</p>
                        <p className="font-medium text-gray-900">${campaign.spentTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CompanyHeader({ companyName, isVerified }: { companyName?: string; isVerified?: boolean }) {
  return (
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
            <Link href="/company/campaigns" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Campaigns</Link>
            <Link href="/company/analytics" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Analytics</Link>
          </nav>

          <div className="flex items-center gap-3">
            {companyName && (
              <span className="text-sm text-gray-600 flex items-center gap-1">
                {companyName}
                {isVerified && (
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
            )}
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">View Site</Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  const valueColor = color === "green" ? "text-green-600" : color === "blue" ? "text-blue-600" : "text-gray-900";
  return (
    <div className="bg-white rounded-xl border p-4">
      <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
      <p className={`text-xl font-bold mt-1 ${valueColor}`}>{value}</p>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}
