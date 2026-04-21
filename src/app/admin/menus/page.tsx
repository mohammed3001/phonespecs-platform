"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";

interface MenuItem {
  id: string;
  title: string;
  url: string | null;
  target: string;
  icon: string | null;
  sortOrder: number;
  parentId: string | null;
  children?: MenuItem[];
}

interface Menu {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  items: MenuItem[];
}

const emptyMenu = { name: "", slug: "", location: "" };
const emptyItem = { title: "", url: "", target: "_self", icon: "", sortOrder: 0, menuId: "", parentId: "" };

export default function AdminMenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [menuForm, setMenuForm] = useState(emptyMenu);
  const [showAddItem, setShowAddItem] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState(emptyItem);
  const [saving, setSaving] = useState(false);

  const fetchMenus = () => {
    setLoading(true);
    fetch("/api/admin/menus")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setMenus(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchMenus(); }, []);

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuForm.name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menuForm),
      });
      const data = await res.json();
      if (data.success) { setShowAddMenu(false); setMenuForm(emptyMenu); fetchMenus(); }
      else alert(data.error);
    } catch { alert("Network error"); }
    setSaving(false);
  };

  const handleDeleteMenu = async (id: string, name: string) => {
    if (!confirm(`Delete menu "${name}" and all its items?`)) return;
    try {
      const res = await fetch(`/api/admin/menus?id=${id}&type=menu`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchMenus();
      else alert(data.error);
    } catch { alert("Network error"); }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.title) return;
    setSaving(true);

    const method = editItem ? "PUT" : "POST";
    const payload = editItem
      ? { ...itemForm, id: editItem, type: "item" }
      : { ...itemForm, type: "item", parentId: itemForm.parentId || null };

    try {
      const res = await fetch("/api/admin/menus", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) { setShowAddItem(null); setEditItem(null); setItemForm(emptyItem); fetchMenus(); }
      else alert(data.error);
    } catch { alert("Network error"); }
    setSaving(false);
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;
    try {
      const res = await fetch(`/api/admin/menus?id=${id}&type=item`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchMenus();
      else alert(data.error);
    } catch { alert("Network error"); }
  };

  const startEditItem = (item: MenuItem, menuId: string) => {
    setEditItem(item.id);
    setItemForm({ title: item.title, url: item.url || "", target: item.target, icon: item.icon || "", sortOrder: item.sortOrder, menuId, parentId: item.parentId || "" });
    setShowAddItem(menuId);
  };

  const renderItem = (item: MenuItem, menuId: string, depth: number = 0) => (
    <div key={item.id}>
      <div className={`flex items-center justify-between py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded`} style={{ paddingLeft: `${12 + depth * 24}px` }}>
        <div className="flex items-center gap-2">
          {item.icon && <span>{item.icon}</span>}
          <span className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</span>
          {item.url && <span className="text-xs text-gray-400">{item.url}</span>}
          {item.target === "_blank" && <Icon icon="mdi:open-in-new" width={12} className="text-gray-400" />}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">#{item.sortOrder}</span>
          <button onClick={() => startEditItem(item, menuId)} className="p-1 hover:bg-gray-200 rounded text-gray-500 dark:text-gray-400">
            <Icon icon="mdi:pencil-outline" width={14} />
          </button>
          <button onClick={() => handleDeleteItem(item.id)} className="p-1 hover:bg-red-100 dark:bg-red-900/30 rounded text-red-400">
            <Icon icon="mdi:delete-outline" width={14} />
          </button>
        </div>
      </div>
      {item.children?.map((child) => renderItem(child, menuId, depth + 1))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Menu Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{menus.length} menus</p>
        </div>
        <button onClick={() => setShowAddMenu(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <Icon icon="mdi:plus" width={18} /> Add Menu
        </button>
      </div>

      {showAddMenu && (
        <form onSubmit={handleCreateMenu} className="bg-white dark:bg-gray-800 rounded-xl border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">New Menu</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Name *</label>
              <input required value={menuForm.name} onChange={(e) => setMenuForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Slug</label>
              <input value={menuForm.slug} onChange={(e) => setMenuForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="Auto-generated" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Location</label>
              <select value={menuForm.location} onChange={(e) => setMenuForm((p) => ({ ...p, location: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">None</option>
                <option value="header">Header</option>
                <option value="footer">Footer</option>
                <option value="sidebar">Sidebar</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">Create</button>
            <button type="button" onClick={() => setShowAddMenu(false)} className="text-gray-600 dark:text-gray-300 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border p-6 animate-pulse"><div className="h-5 bg-gray-200 rounded w-40" /></div>)}</div>
      ) : menus.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-12 text-center">
          <Icon icon="mdi:menu" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No menus yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create menus to manage your site navigation</p>
        </div>
      ) : (
        menus.map((menu) => (
          <div key={menu.id} className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 dark:bg-gray-900">
              <button onClick={() => setExpandedMenu(expandedMenu === menu.id ? null : menu.id)} className="flex items-center gap-3 flex-1 text-left">
                <Icon icon="mdi:menu" width={20} className="text-gray-500 dark:text-gray-400" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{menu.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{menu.items.length} items {menu.location && `• ${menu.location}`}</p>
                </div>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gray-200 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">{menu.slug}</span>
                <button onClick={() => handleDeleteMenu(menu.id, menu.name)} className="p-1.5 hover:bg-red-100 dark:bg-red-900/30 rounded text-red-400">
                  <Icon icon="mdi:delete-outline" width={16} />
                </button>
              </div>
            </div>

            {(expandedMenu === menu.id || true) && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Menu Items</h4>
                  <button onClick={() => { setShowAddItem(menu.id); setEditItem(null); setItemForm({ ...emptyItem, menuId: menu.id }); }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                    <Icon icon="mdi:plus" width={16} /> Add Item
                  </button>
                </div>

                {showAddItem === menu.id && (
                  <form onSubmit={handleSaveItem} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Title *</label>
                        <input required value={itemForm.title} onChange={(e) => setItemForm((p) => ({ ...p, title: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">URL</label>
                        <input value={itemForm.url} onChange={(e) => setItemForm((p) => ({ ...p, url: e.target.value }))}
                          placeholder="/path" className="w-full px-3 py-2 border rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Target</label>
                        <select value={itemForm.target} onChange={(e) => setItemForm((p) => ({ ...p, target: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg text-sm">
                          <option value="_self">Same window</option>
                          <option value="_blank">New tab</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Order</label>
                        <input type="number" value={itemForm.sortOrder} onChange={(e) => setItemForm((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border rounded-lg text-sm" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={saving} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                        {editItem ? "Update" : "Add"}
                      </button>
                      <button type="button" onClick={() => { setShowAddItem(null); setEditItem(null); }} className="text-gray-600 dark:text-gray-300 px-3 py-1.5 text-sm hover:bg-gray-200 rounded-lg">Cancel</button>
                    </div>
                  </form>
                )}

                {menu.items.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No items in this menu</p>
                ) : (
                  <div className="divide-y">{menu.items.map((item) => renderItem(item, menu.id))}</div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
