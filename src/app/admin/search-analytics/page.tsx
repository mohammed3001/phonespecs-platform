"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";

interface Analytics {
  overview: {
    totalPageViews: number;
    totalPhones: number;
    totalArticles: number;
    totalReviews: number;
    totalUsers: number;
    adImpressions: number;
    adClicks: number;
    ctr: number;
  };
  topPhones: Array<{ id: string; name: string; slug: string; viewCount: number }>;
  dailyActivity: Array<{ date: string; actions: number }>;
  actionBreakdown: Record<string, number>;
  entityBreakdown: Record<string, number>;
}

export default function AdminSearchAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/search-analytics")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border p-5 animate-pulse"><div className="h-8 bg-gray-200 rounded w-16" /></div>)}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-12 text-center">
        <Icon icon="mdi:chart-line" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No analytics data</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Analytics data will appear as users interact with the platform</p>
      </div>
    );
  }

  const o = data.overview;
  const maxActions = Math.max(...data.dailyActivity.map((d) => d.actions), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Platform performance and usage metrics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Page Views", value: o.totalPageViews.toLocaleString(), icon: "mdi:eye-outline", color: "blue" },
          { label: "Phones", value: o.totalPhones, icon: "mdi:cellphone", color: "indigo" },
          { label: "Articles", value: o.totalArticles, icon: "mdi:newspaper-variant-outline", color: "green" },
          { label: "Reviews", value: o.totalReviews, icon: "mdi:star-outline", color: "yellow" },
          { label: "Users", value: o.totalUsers, icon: "mdi:account-group-outline", color: "purple" },
          { label: "Ad Impressions", value: o.adImpressions.toLocaleString(), icon: "mdi:bullhorn-outline", color: "orange" },
          { label: "Ad Clicks", value: o.adClicks.toLocaleString(), icon: "mdi:cursor-default-click-outline", color: "pink" },
          { label: "CTR", value: `${o.ctr}%`, icon: "mdi:percent", color: "teal" },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl border p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-lg bg-${card.color}-100 flex items-center justify-center`}>
                <Icon icon={card.icon} width={20} className={`text-${card.color}-600`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Daily Activity (Last 7 Days)</h3>
          <div className="flex items-end gap-2 h-40">
            {data.dailyActivity.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-900 dark:text-white">{day.actions}</span>
                <div className="w-full bg-blue-500 rounded-t" style={{ height: `${(day.actions / maxActions) * 120}px`, minHeight: day.actions > 0 ? "4px" : "0" }} />
                <span className="text-xs text-gray-400">{new Date(day.date).toLocaleDateString("en", { weekday: "short" })}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Phones */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Top Viewed Phones</h3>
          {data.topPhones.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No phone views recorded yet</p>
          ) : (
            <div className="space-y-3">
              {data.topPhones.map((phone, i) => (
                <div key={phone.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{phone.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{phone.viewCount.toLocaleString()} views</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Actions by Type (Last 30 Days)</h3>
          {Object.keys(data.actionBreakdown).length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No actions recorded</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(data.actionBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([action, count]) => {
                  const colors: Record<string, string> = { CREATE: "bg-green-500", UPDATE: "bg-blue-500", DELETE: "bg-red-500", LOGIN: "bg-purple-500" };
                  const total = Object.values(data.actionBreakdown).reduce((s, c) => s + c, 0);
                  return (
                    <div key={action} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-200">{action}</span>
                        <span className="text-gray-500 dark:text-gray-400">{count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`${colors[action] || "bg-gray-500"} h-2 rounded-full`} style={{ width: `${(count / total) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Entity Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Actions by Entity (Last 30 Days)</h3>
          {Object.keys(data.entityBreakdown).length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No entity data</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(data.entityBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([entity, count]) => (
                  <div key={entity} className="flex items-center justify-between py-1.5 px-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 capitalize">{entity}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 px-2 py-0.5 rounded">{count}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
