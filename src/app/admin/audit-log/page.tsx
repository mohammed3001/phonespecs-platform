"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

interface AuditEntry {
  id: number;
  action: string;
  entityType: string;
  entityId: string | null;
  changes: string | null;
  beforeState: string | null;
  afterState: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
}

const actionColors: Record<string, string> = {
  create: "bg-emerald-50 text-emerald-700",
  update: "bg-blue-50 text-blue-700",
  delete: "bg-red-50 text-red-700",
  login: "bg-violet-50 text-violet-700",
  user_registered: "bg-cyan-50 text-cyan-700",
  email_verified: "bg-teal-50 text-teal-700",
  review_submitted: "bg-amber-50 text-amber-700",
  review_approved: "bg-emerald-50 text-emerald-700",
  review_rejected: "bg-red-50 text-red-700",
  review_spam: "bg-gray-100 text-gray-600",
  password_reset: "bg-orange-50 text-orange-700",
  report_resolved: "bg-emerald-50 text-emerald-700",
  report_dismissed: "bg-gray-100 text-gray-600",
};

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filters, setFilters] = useState({ action: "", entityType: "" });
  const [filterOptions, setFilterOptions] = useState<{ entityTypes: string[]; actions: string[] }>({ entityTypes: [], actions: [] });

  const fetchLogs = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "30" });
    if (filters.action) params.set("action", filters.action);
    if (filters.entityType) params.set("entityType", filters.entityType);

    try {
      const res = await fetch(`/api/admin/audit-log?${params}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
        setTotalPages(data.pagination?.totalPages || 1);
        if (data.filters) setFilterOptions(data.filters);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [page, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const getActionColor = (action: string) => {
    for (const [key, val] of Object.entries(actionColors)) {
      if (action.includes(key)) return val;
    }
    return "bg-gray-50 text-gray-600";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-sm text-gray-500 mt-1">Track all actions with before/after state snapshots</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={filters.entityType}
          onChange={(e) => { setFilters({ ...filters, entityType: e.target.value }); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Entity Types</option>
          {filterOptions.entityTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={filters.action}
          onChange={(e) => { setFilters({ ...filters, action: e.target.value }); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Actions</option>
          {filterOptions.actions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        {(filters.action || filters.entityType) && (
          <button
            onClick={() => { setFilters({ action: "", entityType: "" }); setPage(1); }}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-8"></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Icon icon="mdi:clipboard-text-clock" className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No audit logs found</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <>
                    <tr key={log.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                      <td className="px-4 py-3">
                        {(log.beforeState || log.afterState) && (
                          <Icon icon={expandedId === log.id ? "mdi:chevron-down" : "mdi:chevron-right"} className="w-4 h-4 text-gray-400" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{log.user?.name || "System"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {log.entityType}
                        {log.entityId && <span className="text-gray-400 ml-1 text-xs">#{log.entityId.slice(0, 8)}</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                        {log.changes || "—"}
                      </td>
                    </tr>
                    {expandedId === log.id && (log.beforeState || log.afterState) && (
                      <tr key={`${log.id}-detail`}>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50 border-t-0">
                          <div className="grid grid-cols-2 gap-4">
                            {log.beforeState && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                  <Icon icon="mdi:arrow-left" className="w-3 h-3" /> Before
                                </p>
                                <pre className="text-xs text-gray-700 bg-white rounded-lg p-3 border overflow-x-auto max-h-40">
                                  {JSON.stringify(JSON.parse(log.beforeState), null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.afterState && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                  <Icon icon="mdi:arrow-right" className="w-3 h-3" /> After
                                </p>
                                <pre className="text-xs text-gray-700 bg-white rounded-lg p-3 border overflow-x-auto max-h-40">
                                  {JSON.stringify(JSON.parse(log.afterState), null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-white"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
