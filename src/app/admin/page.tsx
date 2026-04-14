"use client";

import { useEffect, useState } from "react";

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
    { label: "Phones", value: stats?.phones || 0, icon: "📱", color: "bg-blue-50 text-blue-700" },
    { label: "Brands", value: stats?.brands || 0, icon: "🏢", color: "bg-green-50 text-green-700" },
    { label: "Articles", value: stats?.articles || 0, icon: "📝", color: "bg-purple-50 text-purple-700" },
    { label: "Users", value: stats?.users || 0, icon: "👥", color: "bg-orange-50 text-orange-700" },
    { label: "Reviews", value: stats?.reviews || 0, icon: "⭐", color: "bg-yellow-50 text-yellow-700" },
    { label: "Campaigns", value: stats?.campaigns || 0, icon: "🎯", color: "bg-red-50 text-red-700" },
  ];

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      available: "bg-green-100 text-green-700",
      coming_soon: "bg-amber-100 text-amber-700",
      discontinued: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">{card.label}</span>
              <span className="text-xl">{card.icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Phones */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-5 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Phones</h2>
          </div>
          <div className="divide-y">
            {recentPhones.length === 0 ? (
              <div className="p-5 text-center text-gray-500">No phones yet</div>
            ) : (
              recentPhones.map((phone) => (
                <div key={phone.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{phone.name}</p>
                    <p className="text-sm text-gray-500">{phone.brand.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusBadge(phone.marketStatus)}`}>
                      {phone.marketStatus.replace("_", " ")}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${phone.isPublished ? "bg-green-500" : "bg-gray-300"}`} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-5 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y">
            {auditLogs.length === 0 ? (
              <div className="p-5 text-center text-gray-500">No activity yet</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{log.user?.name || "System"}</span>{" "}
                      <span className="text-gray-500">{log.action}</span>{" "}
                      <span className="font-medium">{log.entityType}</span>
                    </p>
                    <span className="text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
