"use client";

import { useEffect, useState } from "react";

interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  _count: { users: number; permissions: number };
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/roles")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setRoles(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage user roles and their permissions</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          ))
        ) : (
          roles.map((role) => (
            <div key={role.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 dark:text-white">{role.name}</h3>
                {role.isSystem && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:text-gray-400">System</span>
                )}
              </div>
              {role.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{role.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {role._count.users} users
                </span>
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {role._count.permissions} permissions
                </span>
              </div>
              <div className="mt-3 pt-3 border-t">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Manage Permissions
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
