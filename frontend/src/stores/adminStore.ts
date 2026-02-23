// src/stores/adminStore.ts
import { create } from 'zustand';
import { api } from '@/lib/api';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AdminStore {
  admin: AdminUser | null;
  isLoading: boolean;
  token: string | null;

  login: (identifier: string, password: string, totpCode?: string) => Promise<{ requiresTwoFactor?: boolean }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  setAdmin: (admin: AdminUser | null) => void;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  admin: null,
  isLoading: true,
  token: null,

  login: async (identifier, password, totpCode) => {
    const data = await api.admin.auth.login(identifier, password, totpCode);

    if (data.requiresTwoFactor) {
      return { requiresTwoFactor: true };
    }

    // Store token in cookie (httpOnly not possible client-side, use secure cookie)
    document.cookie = `admin_token=${data.access_token}; path=/; SameSite=Strict; ${window.location.protocol === 'https:' ? 'Secure;' : ''}`;

    set({ admin: data.admin, token: data.access_token });
    return {};
  },

  logout: async () => {
    try { await api.admin.auth.logout(); } catch { /* silent */ }
    // Clear cookie
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    set({ admin: null, token: null });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const admin = await api.admin.auth.me();
      set({ admin, isLoading: false });
      return true;
    } catch {
      set({ admin: null, isLoading: false });
      return false;
    }
  },

  setAdmin: (admin) => set({ admin }),
}));
