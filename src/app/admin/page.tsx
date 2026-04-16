"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/shared/Icon";

interface DashboardStats {
  phones: number;
  brands: number;
  articles: number;
  users: number;
  reviews: number;
  campaigns: number;
}

interface RecentPhone {
  id: string;
  name: string;
  slug: string;
  marketStatus: string;
  isPublished: boolean;
  createdAt: string;
  brand: { name: string };
}

interface AuditEntry {
  id: number;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPhones, setRecentPhones] = useState<RecentPhone[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data.stats);
          setRecentPhones(data.data.recentPhones);
          setAuditLogs(data.data.recentAuditLogs);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Phones", value: stats?.phones || 0, icon: "mdi:cellphone", color: "text-blue-600", bg: "bg-blue-50", href: "/admin/phones" },
    { label: "Brands", value: stats?.brands || 0, icon: "mdi:domain", color: "text-emerald-600", bg: "bg-emerald-50", href: "/admin/brands" },
    { label: "Articles", value: stats?.articles || 0, icon: "mdi:newspaper-variant-outline", color: "text-violet-600", bg: "bg-violet-50", href: "/admin/articles" },
    { label: "Users", value: stats?.users || 0, icon: "mdi:account-group-outline", color: "text-orange-600", bg: "bg-orange-50", href: "/admin/users" },
    { label: "Reviews", value: stats?.reviews || 0, icon: "mdi:star-outline", color: "text-amber-600", bg: "bg-amber-50", href: "#" },
    { label: "Campaigns", value: stats?.campaigns || 0, icon: "mdi:target", color: "text-rose-600", bg: "bg-rose-50", href: "/admin/campaigns" },
  ];

  const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    available: { label: "Available", color: "bg-emerald-50 text-emerald-700", icon: "mdi:check-circle-outline" },
    coming_soon: { label: "Coming Soon", color: "bg-amber-50 text-amber-700", icon: "mdi:clock-outline" },
    discontinued: { label: "Discontinued", color: "bg-gray-100 text-gray-600", icon: "mdi:close-circle-outline" },
    rumored: { label: "Rumored", color: "bg-purple-50 text-purple-700", icon: "mdi:help-circle-outline" },
  };

  const actionIcons: Record<string, string> = {
    CREATE: "mdi:plus-circle-outline",
    UPDATE: "mdi:pencil-outline",
    DELETE: "mdi:delete-outline",
    LOGIN: "mdi:login",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back. Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center`}>
                <Icon icon={card.icon} width={20} className={card.color} />
              </div>
              <Icon icon="mdi:chevron-right" width={16} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Add Phone", icon: "mdi:cellphone-plus", href: "/admin/phones/new", color: "text-blue-600" },
          { label: "Write Article", icon: "mdi:pencil-plus-outline", href: "/admin/articles/new", color: "text-violet-600" },
          { label: "Add Brand", icon: "mdi:domain-plus", href: "/admin/brands", color: "text-emerald-600" },
          { label: "View Site", icon: "mdi:open-in-new", href: "/", color: "text-gray-600" },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            target={action.href === "/" ? "_blank" : undefined}
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-blue-200 hover:shadow-sm transition-all text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <Icon icon={action.icon} width={20} className={action.color} />
            {action.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Phones */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:cellphone" width={18} className="text-blue-600" />
              <h2 className="font-semibold text-gray-900">Recent Phones</h2>
            </div>
            <Link href="/admin/phones" className="text-xs font-medium text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentPhones.length === 0 ? (
              <div className="p-8 text-center">
                <Icon icon="mdi:cellphone-off" width={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No phones yet</p>
                <Link href="/admin/phones/new" className="text-sm text-blue-600 font-medium hover:underline mt-1 inline-block">
                  Add your first phone
                </Link>
              </div>
            ) : (
              recentPhones.map((phone) => {
                const status = statusConfig[phone.marketStatus] || statusConfig.available;
                return (
                  <div key={phone.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Icon icon="mdi:cellphone" width={18} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{phone.name}</p>
                        <p className="text-xs text-gray-500">{phone.brand.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${phone.isPublished ? "bg-emerald-500" : "bg-gray-300"}`} title={phone.isPublished ? "Published" : "Draft"} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:history" width={18} className="text-violet-600" />
              <h2 className="font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <Link href="/admin/audit-log" className="text-xs font-medium text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center">
                <Icon icon="mdi:history" width={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No activity yet</p>
              </div>
            ) : (
              auditLogs.map((log) => {
                const icon = actionIcons[log.action] || "mdi:information-outline";
                return (
                  <div key={log.id} className="px-5 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon icon={icon} width={16} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900">{log.user?.name || "System"}</span>{" "}
                        <span className="text-gray-500">{log.action.toLowerCase()}</span>{" "}
                        <span className="font-medium">{log.entityType}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
