"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DailyStat {
  date: string;
  impressions: number;
  clicks: number;
  spent: number;
}

export default function CompanyAnalyticsPage() {
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetch(`/api/company/portal?section=analytics&days=${days}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setDailyStats(res.data.dailyStats);
        else setError(res.error);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  }, [days]);

  const totals = dailyStats.reduce(
    (acc, d) => ({
      impressions: acc.impressions + d.impressions,
      clicks: acc.clicks + d.clicks,
      spent: acc.spent + d.spent,
    }),
    { impressions: 0, clicks: 0, spent: 0 }
  );

  const ctr = totals.impressions > 0 ? ((totals.clicks / totals.impressions) * 100).toFixed(2) : "0.00";
  const maxImpressions = Math.max(...dailyStats.map((d) => d.impressions), 1);

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
              <Link href="/company/campaigns" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Campaigns</Link>
              <Link href="/company/analytics" className="text-sm text-gray-900 font-semibold">Analytics</Link>
            </nav>
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">View Site</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Campaign performance over time</p>
          </div>
          <div className="flex gap-2">
            {[7, 14, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  days === d ? "bg-blue-600 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <p className="text-gray-500 font-medium">{error}</p>
            <Link href="/login?callbackUrl=/company/analytics" className="text-blue-600 text-sm font-medium mt-2 inline-block">Sign In →</Link>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-xl border p-8 animate-pulse">
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border p-4">
                <p className="text-xs font-medium text-gray-500 uppercase">Impressions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totals.impressions.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-xs font-medium text-gray-500 uppercase">Clicks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totals.clicks.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-xs font-medium text-gray-500 uppercase">CTR</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{ctr}%</p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-xs font-medium text-gray-500 uppercase">Spent</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${totals.spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Performance</h2>
              {dailyStats.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-400">
                  No data for the selected period
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Bar chart */}
                  <div className="flex items-end gap-1 h-48">
                    {dailyStats.map((d) => (
                      <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                        <div
                          className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors min-h-[2px]"
                          style={{ height: `${(d.impressions / maxImpressions) * 100}%` }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                            <p className="font-medium">{d.date}</p>
                            <p>{d.impressions.toLocaleString()} impressions</p>
                            <p>{d.clicks.toLocaleString()} clicks</p>
                            <p>${d.spent.toFixed(2)} spent</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* X axis labels */}
                  <div className="flex gap-1">
                    {dailyStats.map((d, i) => (
                      <div key={d.date} className="flex-1 text-center">
                        {i % Math.ceil(dailyStats.length / 7) === 0 && (
                          <p className="text-[10px] text-gray-400">{d.date.slice(5)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Daily Stats Table */}
            {dailyStats.length > 0 && (
              <div className="bg-white rounded-xl border overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Daily Breakdown</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Impressions</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Clicks</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">CTR</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Spent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {[...dailyStats].reverse().map((d) => (
                        <tr key={d.date} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{d.date}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right">{d.impressions.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right">{d.clicks.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-blue-600 text-right font-medium">
                            {d.impressions > 0 ? ((d.clicks / d.impressions) * 100).toFixed(2) : "0.00"}%
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right">
                            ${d.spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
