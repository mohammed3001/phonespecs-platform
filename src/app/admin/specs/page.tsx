"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";

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
  subSection: string | null;
  sortOrder: number;
}

interface SpecGroup {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sortOrder: number;
  definitions: SpecDefinition[];
}

const emptyGroup = { name: "", slug: "", icon: "", sortOrder: 0 };
const emptySpec = { name: "", slug: "", key: "", icon: "", unit: "", dataType: "text", showInCard: false, showInDetail: true, showInCompare: true, isFilterable: false, isHighlighted: false, subSection: "", sortOrder: 0, groupId: "" };

export default function AdminSpecsPage() {
  const [groups, setGroups] = useState<SpecGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [editGroup, setEditGroup] = useState<string | null>(null);
  const [groupForm, setGroupForm] = useState(emptyGroup);
  const [showAddSpec, setShowAddSpec] = useState<string | null>(null);
  const [editSpec, setEditSpec] = useState<string | null>(null);
  const [specForm, setSpecForm] = useState(emptySpec);
  const [saving, setSaving] = useState(false);

  const fetchGroups = () => {
    setLoading(true);
    fetch("/api/admin/spec-groups")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setGroups(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupForm.name) return;
    setSaving(true);

    const method = editGroup ? "PUT" : "POST";
    const payload = editGroup ? { ...groupForm, id: editGroup } : groupForm;

    try {
      const res = await fetch("/api/admin/spec-groups", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddGroup(false);
        setEditGroup(null);
        setGroupForm(emptyGroup);
        fetchGroups();
      } else {
        alert(data.error);
      }
    } catch { alert("Network error"); }
    setSaving(false);
  };

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!confirm(`Delete group "${name}"? All specs in this group must be removed first.`)) return;
    try {
      const res = await fetch(`/api/admin/spec-groups?id=${id}&type=group`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchGroups();
      else alert(data.error);
    } catch { alert("Network error"); }
  };

  const handleSaveSpec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specForm.name) return;
    setSaving(true);

    const method = editSpec ? "PUT" : "POST";
    const payload = editSpec
      ? { ...specForm, id: editSpec, type: "spec" }
      : { ...specForm, type: "spec" };

    try {
      const res = await fetch("/api/admin/spec-groups", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddSpec(null);
        setEditSpec(null);
        setSpecForm(emptySpec);
        fetchGroups();
      } else {
        alert(data.error);
      }
    } catch { alert("Network error"); }
    setSaving(false);
  };

  const handleDeleteSpec = async (id: string, name: string) => {
    if (!confirm(`Delete spec "${name}"? This will remove all phone values for this spec.`)) return;
    try {
      const res = await fetch(`/api/admin/spec-groups?id=${id}&type=spec`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchGroups();
      else alert(data.error);
    } catch { alert("Network error"); }
  };

  const startEditGroup = (g: SpecGroup) => {
    setEditGroup(g.id);
    setGroupForm({ name: g.name, slug: g.slug, icon: g.icon || "", sortOrder: g.sortOrder });
    setShowAddGroup(true);
  };

  const startEditSpec = (spec: SpecDefinition, groupId: string) => {
    setEditSpec(spec.id);
    setSpecForm({
      name: spec.name, slug: spec.slug, key: spec.key, icon: spec.icon || "",
      unit: spec.unit || "", dataType: spec.dataType, showInCard: spec.showInCard,
      showInDetail: spec.showInDetail, showInCompare: spec.showInCompare,
      isFilterable: spec.isFilterable, isHighlighted: spec.isHighlighted,
      subSection: spec.subSection || "", sortOrder: spec.sortOrder, groupId,
    });
    setShowAddSpec(groupId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Specifications Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{groups.length} groups, {groups.reduce((sum, g) => sum + g.definitions.length, 0)} specs total</p>
        </div>
        <button
          onClick={() => { setShowAddGroup(true); setEditGroup(null); setGroupForm(emptyGroup); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <Icon icon="mdi:plus" width={18} />
          Add Group
        </button>
      </div>

      {/* Add/Edit Group Form */}
      {showAddGroup && (
        <form onSubmit={handleSaveGroup} className="bg-white dark:bg-gray-800 rounded-xl border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{editGroup ? "Edit Group" : "New Group"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Name *</label>
              <input required value={groupForm.name} onChange={(e) => setGroupForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Slug</label>
              <input value={groupForm.slug} onChange={(e) => setGroupForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="Auto-generated" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Icon</label>
              <input value={groupForm.icon} onChange={(e) => setGroupForm((p) => ({ ...p, icon: e.target.value }))}
                placeholder="e.g. 📱" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Sort Order</label>
              <input type="number" value={groupForm.sortOrder} onChange={(e) => setGroupForm((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Saving..." : editGroup ? "Update" : "Create"}
            </button>
            <button type="button" onClick={() => { setShowAddGroup(false); setEditGroup(null); }} className="text-gray-600 dark:text-gray-300 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-40" />
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-12 text-center">
          <Icon icon="mdi:format-list-bulleted" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No spec groups yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create a group to organize phone specifications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border overflow-hidden">
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <button onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)} className="flex items-center gap-3 flex-1 text-left">
                  <span className="text-xl">{group.icon || "📋"}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{group.definitions.length} specs &bull; Order: {group.sortOrder}</p>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 px-2 py-1 rounded-full">{group.slug}</span>
                  <button onClick={() => startEditGroup(group)} className="p-1.5 hover:bg-gray-200 rounded text-gray-500 dark:text-gray-400" title="Edit">
                    <Icon icon="mdi:pencil-outline" width={16} />
                  </button>
                  <button onClick={() => handleDeleteGroup(group.id, group.name)} className="p-1.5 hover:bg-red-100 dark:bg-red-900/30 rounded text-red-400" title="Delete">
                    <Icon icon="mdi:delete-outline" width={16} />
                  </button>
                  <Icon icon="mdi:chevron-down" width={20} className={`text-gray-400 transition-transform ${expandedGroup === group.id ? "rotate-180" : ""}`} />
                </div>
              </div>

              {expandedGroup === group.id && (
                <div className="border-t">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Spec Definitions</h4>
                      <button
                        onClick={() => { setShowAddSpec(group.id); setEditSpec(null); setSpecForm({ ...emptySpec, groupId: group.id }); }}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      >
                        <Icon icon="mdi:plus" width={16} /> Add Spec
                      </button>
                    </div>

                    {/* Add/Edit Spec Form */}
                    {showAddSpec === group.id && (
                      <form onSubmit={handleSaveSpec} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Name *</label>
                            <input required value={specForm.name} onChange={(e) => setSpecForm((p) => ({ ...p, name: e.target.value }))}
                              className="w-full px-3 py-2 border rounded-lg text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Key</label>
                            <input value={specForm.key} onChange={(e) => setSpecForm((p) => ({ ...p, key: e.target.value }))}
                              placeholder="Auto" className="w-full px-3 py-2 border rounded-lg text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Unit</label>
                            <input value={specForm.unit} onChange={(e) => setSpecForm((p) => ({ ...p, unit: e.target.value }))}
                              placeholder="e.g. mAh, MP" className="w-full px-3 py-2 border rounded-lg text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Data Type</label>
                            <select value={specForm.dataType} onChange={(e) => setSpecForm((p) => ({ ...p, dataType: e.target.value }))}
                              className="w-full px-3 py-2 border rounded-lg text-sm">
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="boolean">Boolean</option>
                              <option value="select">Select</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {([["showInCard", "Card"], ["showInDetail", "Detail"], ["showInCompare", "Compare"], ["isFilterable", "Filterable"], ["isHighlighted", "Highlight"]] as const).map(([field, label]) => (
                            <label key={field} className="flex items-center gap-2 text-sm">
                              <input type="checkbox" checked={specForm[field] as boolean} onChange={(e) => setSpecForm((p) => ({ ...p, [field]: e.target.checked }))}
                                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" />
                              {label}
                            </label>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                            {saving ? "Saving..." : editSpec ? "Update" : "Create"}
                          </button>
                          <button type="button" onClick={() => { setShowAddSpec(null); setEditSpec(null); }} className="text-gray-600 dark:text-gray-300 px-3 py-1.5 text-sm hover:bg-gray-200 rounded-lg">Cancel</button>
                        </div>
                      </form>
                    )}

                    {group.definitions.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No specifications defined in this group</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900">
                              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Name</th>
                              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Key</th>
                              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Unit</th>
                              <th className="text-center px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Card</th>
                              <th className="text-center px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Detail</th>
                              <th className="text-center px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Compare</th>
                              <th className="text-center px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Filter</th>
                              <th className="text-center px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Highlight</th>
                              <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {group.definitions.map((def) => (
                              <tr key={def.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{def.name}</td>
                                <td className="px-3 py-2 text-gray-500 dark:text-gray-400 font-mono text-xs">{def.key}</td>
                                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{def.unit || "—"}</td>
                                {(["showInCard", "showInDetail", "showInCompare", "isFilterable", "isHighlighted"] as const).map((field) => (
                                  <td key={field} className="px-3 py-2 text-center">
                                    <span className={`w-5 h-5 inline-flex items-center justify-center rounded text-xs ${def[field] ? "bg-green-100 dark:bg-green-900/30 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                                      {def[field] ? "Y" : "—"}
                                    </span>
                                  </td>
                                ))}
                                <td className="px-3 py-2 text-right space-x-2">
                                  <button onClick={() => startEditSpec(def, group.id)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                                  <button onClick={() => handleDeleteSpec(def.id, def.name)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
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
      )}
    </div>
  );
}
