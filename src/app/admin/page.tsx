"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/shared/Icon";

interface DashboardData {
  stats: Record<string, number>;
  reviewStats: { pending: number; approved: number; rejected: number; total: number };
  articleStats: { published: number; draft: number; total: number };
  adStats: { impressions: number; clicks: number; ctr: string; activeCampaigns: number };
  moderationStats: { pendingReports: number };
  growth: { phones: number; users: number; reviews: number; articles: number };
  totalPhoneViews: number;
  recentPhones: Array<{ id: string; name: string; slug: string; createdAt: string; brand: { name: string } }>;
  recentAuditLogs: Array<{ id: string; action: string; entityType: string; entityId: string; createdAt: string; user: { name: string; email: string } | null }>;
  recentErrors: Array<{ id: string; action: string; entityType: string; entityId: string; createdAt: string; user: { name: string } | null }>;
  activityBreakdown: Array<{ action: string; _count: number }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-16 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-500">Failed to load dashboard data</div>;
  }

  const statCards = [
    { label: "Phones", value: data.stats.phones, icon: "mdi:cellphone", color: "text-blue-600 bg-blue-50", href: "/admin/phones", growth: data.growth.phones },
    { label: "Brands", value: data.stats.brands, icon: "mdi:domain", color: "text-purple-600 bg-purple-50", href: "/admin/brands" },
    { label: "Articles", value: data.stats.articles, icon: "mdi:newspaper-variant-outline", color: "text-green-600 bg-green-50", href: "/admin/articles", growth: data.growth.articles },
    { label: "Users", value: data.stats.users, icon: "mdi:account-group", color: "text-orange-600 bg-orange-50", href: "/admin/users", growth: data.growth.users },
    { label: "Reviews", value: data.stats.reviews, icon: "mdi:star-outline", color: "text-yellow-600 bg-yellow-50", href: "/admin/reviews", growth: data.growth.reviews },
    { label: "Companies", value: data.stats.companies, icon: "mdi:office-building-outline", color: "text-indigo-600 bg-indigo-50", href: "/admin/companies" },
    { label: "Categories", value: data.stats.categories, icon: "mdi:folder-outline", color: "text-teal-600 bg-teal-50", href: "/admin/categories" },
    { label: "Tags", value: data.stats.tags, icon: "mdi:tag-outline", color: "text-pink-600 bg-pink-50", href: "/admin/tags" },
    { label: "Campaigns", value: data.stats.campaigns, icon: "mdi:bullhorn-outline", color: "text-red-600 bg-red-50", href: "/admin/campaigns" },
    { label: "Media", value: data.stats.media, icon: "mdi:image-outline", color: "text-cyan-600 bg-cyan-50", href: "/admin/media" },
  ];

  const quickActions = [
    { label: "Add Phone", icon: "mdi:cellphone-plus", href: "/admin/phones/new", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Add Brand", icon: "mdi:domain-plus", href: "/admin/brands/new", color: "bg-purple-600 hover:bg-purple-700" },
    { label: "Write Article", icon: "mdi:pencil-plus", href: "/admin/articles/new", color: "bg-green-600 hover:bg-green-700" },
    { label: "View Site", icon: "mdi:open-in-new", href: "/", color: "bg-gray-700 hover:bg-gray-800", external: true },
  ];

  const actionIcons: Record<string, string> = {
    CREATE: "mdi:plus-circle-outline",
    UPDATE: "mdi:pencil-outline",
    DELETE: "mdi:delete-outline",
    LOGIN: "mdi:login",
  };

  const actionColors: Record<string, string> = {
    CREATE: "text-green-600 bg-green-50",
    UPDATE: "text-blue-600 bg-blue-50",
    DELETE: "text-red-600 bg-red-50",
    LOGIN: "text-purple-600 bg-purple-50",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform overview and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          {data.moderationStats.pendingReports > 0 && (
            <Link href="/admin/moderation" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100">
              <Icon icon="mdi:flag" width={16} />
              {data.moderationStats.pendingReports} reports
            </Link>
          )}
          {data.reviewStats.pending > 0 && (
            <Link href="/admin/reviews" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-100">
              <Icon icon="mdi:clock-outline" width={16} />
              {data.reviewStats.pending} pending reviews
            </Link>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            target={action.external ? "_blank" : undefined}
            className={`${action.color} text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors`}
          >
            <Icon icon={action.icon} width={18} />
            {action.label}
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase">{card.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                <Icon icon={card.icon} width={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            {card.growth !== undefined && card.growth > 0 && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-0.5">
                <Icon icon="mdi:trending-up" width={14} />
                +{card.growth} this month
              </p>
            )}
          </Link>
        ))}
      </div>

      {/* Middle Section: Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Review Analytics */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Icon icon="mdi:star-outline" width={18} className="text-yellow-500" />
            Review Analytics
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-semibold">{data.reviewStats.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-amber-600">Pending</span>
              <span className="font-semibold text-amber-600">{data.reviewStats.pending}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Approved</span>
              <span className="font-semibold text-green-600">{data.reviewStats.approved}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-red-600">Rejected</span>
              <span className="font-semibold text-red-600">{data.reviewStats.rejected}</span>
            </div>
          </div>
          {data.reviewStats.total > 0 && (
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden flex">
              <div className="bg-green-500 h-full" style={{ width: `${(data.reviewStats.approved / data.reviewStats.total) * 100}%` }} />
              <div className="bg-amber-500 h-full" style={{ width: `${(data.reviewStats.pending / data.reviewStats.total) * 100}%` }} />
              <div className="bg-red-500 h-full" style={{ width: `${(data.reviewStats.rejected / data.reviewStats.total) * 100}%` }} />
            </div>
          )}
        </div>

        {/* Ad Performance */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Icon icon="mdi:bullhorn-outline" width={18} className="text-blue-500" />
            Ad Performance
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Impressions</span>
              <span className="font-semibold">{data.adStats.impressions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Clicks</span>
              <span className="font-semibold">{data.adStats.clicks.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">CTR</span>
              <span className="font-semibold text-blue-600">{data.adStats.ctr}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Active Campaigns</span>
              <span className="font-semibold">{data.adStats.activeCampaigns}</span>
            </div>
          </div>
        </div>

        {/* Content Stats */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Icon icon="mdi:chart-bar" width={18} className="text-green-500" />
            Content Overview
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Page Views</span>
              <span className="font-semibold">{data.totalPhoneViews.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Published Articles</span>
              <span className="font-semibold text-green-600">{data.articleStats.published}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Draft Articles</span>
              <span className="font-semibold text-gray-400">{data.articleStats.draft}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Pending Moderation</span>
              <span className="font-semibold text-red-600">{data.moderationStats.pendingReports}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Breakdown */}
      {data.activityBreakdown.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Activity (Last 7 Days)</h3>
          <div className="flex flex-wrap gap-3">
            {data.activityBreakdown.map((item) => (
              <div key={item.action} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${actionColors[item.action] || "bg-gray-50 text-gray-700"}`}>
                <Icon icon={actionIcons[item.action] || "mdi:circle-outline"} width={16} />
                <span className="text-sm font-medium capitalize">{item.action.toLowerCase()}</span>
                <span className="text-sm font-bold">{item._count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Section: Recent Items + Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Phones */}
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Recent Phones</h3>
            <Link href="/admin/phones" className="text-xs text-blue-600 hover:text-blue-800 font-medium">View all</Link>
          </div>
          <div className="divide-y">
            {data.recentPhones.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-500">No phones added yet</p>
            ) : (
              data.recentPhones.map((phone) => (
                <div key={phone.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{phone.name}</p>
                    <p className="text-xs text-gray-500">{phone.brand.name}</p>
                  </div>
                  <span className="text-xs text-gray-400">{timeAgo(phone.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
            <Link href="/admin/audit-log" className="text-xs text-blue-600 hover:text-blue-800 font-medium">View all</Link>
          </div>
          <div className="divide-y max-h-80 overflow-y-auto">
            {data.recentAuditLogs.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-500">No activity recorded</p>
            ) : (
              data.recentAuditLogs.map((log) => (
                <div key={log.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${actionColors[log.action] || "bg-gray-50 text-gray-500"}`}>
                    <Icon icon={actionIcons[log.action] || "mdi:circle-outline"} width={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{log.user?.name || "System"}</span>
                      <span className="text-gray-500"> {log.action.toLowerCase()} </span>
                      <span className="font-medium">{log.entityType}</span>
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(log.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Errors/Warnings Section */}
      {data.recentErrors.length > 0 && (
        <div className="bg-red-50 rounded-xl border border-red-200">
          <div className="px-5 py-4 border-b border-red-200 flex items-center gap-2">
            <Icon icon="mdi:alert-circle-outline" width={18} className="text-red-600" />
            <h3 className="text-sm font-semibold text-red-800">Recent Warnings</h3>
          </div>
          <div className="divide-y divide-red-100">
            {data.recentErrors.map((err) => (
              <div key={err.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:alert-outline" width={16} className="text-red-500" />
                  <p className="text-sm text-red-800">
                    {err.action} on {err.entityType}
                    {err.user && <span className="text-red-600"> by {err.user.name}</span>}
                  </p>
                </div>
                <span className="text-xs text-red-500">{timeAgo(err.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
