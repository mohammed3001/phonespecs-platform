"use client";

import { useEffect, useState } from "react";

interface SpecGroup {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sortOrder: number;
  definitions: SpecDefinition[];
}

interface SpecDefinition {
  id: string;
  name: string;
  slug: string;
  key: string;
  icon: string | null;
  unit: string | null;
  dataType: string;
  showInCard: boolean;
  showInDetail: boolean;
  showInCompare: boolean;
  isFilterable: boolean;
  isHighlighted: boolean;
  sortOrder: number;
}

export default function AdminSpecsPage() {
  const [groups, setGroups] = useState<SpecGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/specs")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setGroups(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Specifications Management</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-4">
              <div className="h-5 bg-gray-200 rounded w-40"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Specifications Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage specification groups and definitions. Control what specs appear in cards, details, and comparisons.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Group
        </button>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <button
              onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{group.icon || "📋"}</span>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">{group.name}</h3>
                  <p className="text-xs text-gray-500">{group.definitions.length} specifications • Sort order: {group.sortOrder}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{group.slug}</span>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedGroup === group.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {expandedGroup === group.id && (
              <div className="border-t">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Spec Definitions</h4>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      + Add Spec
                    </button>
                  </div>
                  {group.definitions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No specifications defined in this group</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Name</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Key</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Icon</th>
                            <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Unit</th>
                            <th className="text-center px-3 py-2 text-xs font-medium text-gray-500">Card</th>
                            <th className="text-center px-3 py-2 text-xs font-medium text-gray-500">Detail</th>
                            <th className="text-center px-3 py-2 text-xs font-medium text-gray-500">Compare</th>
                            <th className="text-center px-3 py-2 text-xs font-medium text-gray-500">Filter</th>
                            <th className="text-center px-3 py-2 text-xs font-medium text-gray-500">Highlight</th>
                            <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {group.definitions.map((def) => (
                            <tr key={def.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-900">{def.name}</td>
                              <td className="px-3 py-2 text-gray-500 font-mono text-xs">{def.key}</td>
                              <td className="px-3 py-2">{def.icon || "—"}</td>
                              <td className="px-3 py-2 text-gray-500">{def.unit || "—"}</td>
                              <td className="px-3 py-2 text-center">
                                <span className={`w-5 h-5 inline-flex items-center justify-center rounded ${def.showInCard ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                                  {def.showInCard ? "✓" : "—"}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className={`w-5 h-5 inline-flex items-center justify-center rounded ${def.showInDetail ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                                  {def.showInDetail ? "✓" : "—"}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className={`w-5 h-5 inline-flex items-center justify-center rounded ${def.showInCompare ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                                  {def.showInCompare ? "✓" : "—"}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className={`w-5 h-5 inline-flex items-center justify-center rounded ${def.isFilterable ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}`}>
                                  {def.isFilterable ? "✓" : "—"}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className={`w-5 h-5 inline-flex items-center justify-center rounded ${def.isHighlighted ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-400"}`}>
                                  {def.isHighlighted ? "★" : "—"}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right">
                                <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
