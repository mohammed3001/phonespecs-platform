"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";

interface Report {
  id: string;
  entityType: string;
  entityId: string;
  reason: string;
  description: string | null;
  status: string;
  moderationNote: string | null;
  createdAt: string;
  reporter: { name: string; email: string } | null;
  review: { title: string | null; content: string | null; overallScore: number | null; user: { name: string } | null } | null;
  moderatedBy: { name: string } | null;
}

const reasonIcons: Record<string, string> = {
  spam: "mdi:email-alert",
  inappropriate: "mdi:alert-circle",
  misleading: "mdi:information",
  offensive: "mdi:hand-back-left",
  other: "mdi:help-circle",
};

export default function AdminModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReports = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/moderation?status=${status}`);
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchReports(filter); }, [filter]);

  const handleAction = async (reportId: string, action: "dismiss" | "remove") => {
    setActionLoading(reportId);
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, action }),
      });
      const data = await res.json();
      if (data.success) fetchReports(filter);
    } catch (err) {
      console.error("Action failed:", err);
    }
    setActionLoading(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moderation Queue</h1>
          <p className="text-sm text-gray-500 mt-1">Review user reports and take action on flagged content</p>
        </div>
        {stats.pending ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-sm font-medium rounded-lg">
            <Icon icon="mdi:flag" className="w-4 h-4" />
            {stats.pending} pending
          </span>
        ) : null}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {[
          { key: "pending", label: "Pending" },
          { key: "resolved", label: "Resolved" },
          { key: "dismissed", label: "Dismissed" },
          { key: "all", label: "All" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
            {stats[tab.key] ? <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full ml-1.5">{stats[tab.key]}</span> : null}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <Icon icon="mdi:shield-check" className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
            <p className="text-gray-500">No {filter === "all" ? "" : filter} reports</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl border p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${report.status === "pending" ? "bg-red-100" : "bg-gray-100"}`}>
                    <Icon icon={reasonIcons[report.reason] || "mdi:flag"} className={`w-5 h-5 ${report.status === "pending" ? "text-red-500" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm capitalize">{report.reason} Report</p>
                    <p className="text-xs text-gray-500">
                      by {report.reporter?.name || "Unknown"} • {new Date(report.createdAt).toLocaleDateString()} •
                      <span className="capitalize ml-1">{report.entityType}</span>
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  report.status === "pending" ? "bg-amber-50 text-amber-700" :
                  report.status === "resolved" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {report.status}
                </span>
              </div>

              {report.description && (
                <p className="text-sm text-gray-700 mb-3 bg-gray-50 rounded-lg p-3">{report.description}</p>
              )}

              {/* Reported Content Preview */}
              {report.review && (
                <div className="border rounded-lg p-3 mb-3 bg-gray-50/50">
                  <p className="text-xs text-gray-500 mb-1">Reported Review:</p>
                  <p className="text-sm font-medium text-gray-900">{report.review.title || "Untitled"}</p>
                  <p className="text-xs text-gray-600 line-clamp-2 mt-1">{report.review.content}</p>
                  <p className="text-xs text-gray-400 mt-1">by {report.review.user?.name || "Unknown"}</p>
                </div>
              )}

              {report.moderatedBy && (
                <p className="text-xs text-gray-500 mb-3">
                  Moderated by <strong>{report.moderatedBy.name}</strong>
                  {report.moderationNote && `: ${report.moderationNote}`}
                </p>
              )}

              {report.status === "pending" && (
                <div className="flex items-center gap-2 pt-3 border-t">
                  <button
                    onClick={() => handleAction(report.id, "remove")}
                    disabled={actionLoading === report.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <Icon icon="mdi:delete" className="w-4 h-4" />
                    Remove Content
                  </button>
                  <button
                    onClick={() => handleAction(report.id, "dismiss")}
                    disabled={actionLoading === report.id}
                    className="flex items-center gap-1.5 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Icon icon="mdi:close" className="w-4 h-4" />
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
