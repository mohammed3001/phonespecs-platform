"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";

interface SpecHistoryEntry {
  id: number;
  oldValue: string;
  newValue: string;
  source: string | null;
  reason: string | null;
  changedAt: string;
  phoneSpec: {
    spec: { name: string; key: string; unit: string | null };
    phone: { name: string; slug: string };
  };
  changedBy: { name: string; email: string } | null;
}

export default function AdminSpecHistoryPage() {
  const [history, setHistory] = useState<SpecHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/spec-history")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setHistory(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Spec Change History</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track all specification changes across phones</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Time</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Spec</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Old Value</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">New Value</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Changed By</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Icon icon="mdi:history" className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No spec changes recorded yet</p>
                    <p className="text-gray-400 text-xs mt-1">Changes will appear here when phone specs are updated</p>
                  </td>
                </tr>
              ) : (
                history.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(entry.changedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{entry.phoneSpec.phone.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                      {entry.phoneSpec.spec.name}
                      {entry.phoneSpec.spec.unit && <span className="text-gray-400 ml-1">({entry.phoneSpec.spec.unit})</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">{entry.oldValue}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{entry.newValue}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{entry.changedBy?.name || "System"}</td>
                    <td className="px-4 py-3">
                      {entry.source ? (
                        <span className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 rounded-full">{entry.source}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
