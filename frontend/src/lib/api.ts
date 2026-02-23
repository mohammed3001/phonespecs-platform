// src/lib/api.ts
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const locale = document.documentElement.lang || 'en';
    config.headers['Accept-Language'] = locale;
    const token = document.cookie.match(/admin_token=([^;]+)/)?.[1];
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  phones: {
    async getList(params?: any) {
      const { data } = await apiClient.get('/phones', { params });
      return data;
    },
    async getBySlug(brandSlug: string, phoneSlug: string, locale: string) {
      const { data } = await apiClient.get(`/phones/${brandSlug}/${phoneSlug}`, {
        headers: { 'Accept-Language': locale },
      });
      return data;
    },
    async getFeatured(locale: string) {
      const { data } = await apiClient.get('/phones/featured', { params: { locale } });
      return data;
    },
    async compare(phoneIds: string[], locale: string) {
      const { data } = await apiClient.post('/phones/compare', { phoneIds, locale });
      return data;
    },
    async search(query: string, locale: string, page = 1) {
      const { data } = await apiClient.get('/phones/search', { params: { q: query, locale, page } });
      return data;
    },
  },

  brands: {
    async getAll(locale: string) {
      const { data } = await apiClient.get('/brands', { params: { locale } });
      return data;
    },
    async getBySlug(slug: string, locale: string) {
      const { data } = await apiClient.get(`/brands/${slug}`, { params: { locale } });
      return data;
    },
  },

  languages: {
    async getActive() {
      const { data } = await apiClient.get('/languages/active');
      return data;
    },
    async getTranslations(locale: string) {
      const { data } = await apiClient.get(`/translations/${locale}`);
      return data;
    },
  },

  settings: {
    async getPublic() {
      const { data } = await apiClient.get('/settings/public');
      return data;
    },
  },

  admin: {
    auth: {
      async login(identifier: string, password: string, totpCode?: string) {
        const { data } = await apiClient.post('/auth/login', { identifier, password, totpCode });
        return data;
      },
      async logout() {
        await apiClient.post('/auth/logout');
      },
      async me() {
        const { data } = await apiClient.get('/auth/me');
        return data;
      },
      async changePassword(currentPassword: string, newPassword: string) {
        const { data } = await apiClient.patch('/auth/password', { currentPassword, newPassword });
        return data;
      },
      async logoutAll() {
        await apiClient.post('/auth/logout-all');
      },
      async setupTwoFactor() {
        const { data } = await apiClient.post('/auth/2fa/setup');
        return data;
      },
      async enableTwoFactor(token: string) {
        const { data } = await apiClient.post('/auth/2fa/enable', { token });
        return data;
      },
    },

    settings: {
      async get() {
        const { data } = await apiClient.get('/admin/settings');
        return data;
      },
      async update(updates: Record<string, any>) {
        const { data } = await apiClient.patch('/admin/settings', updates);
        return data;
      },
    },

    phones: {
      async list(params?: any) {
        const { data } = await apiClient.get('/admin/phones', { params });
        return data;
      },
      async create(body: FormData | any) {
        const isFormData = body instanceof FormData;
        const { data } = await apiClient.post('/admin/phones', body, {
          headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
        });
        return data;
      },
      async update(id: string, body: any) {
        const { data } = await apiClient.patch(`/admin/phones/${id}`, body);
        return data;
      },
      async delete(id: string) {
        await apiClient.delete(`/admin/phones/${id}`);
      },
    },

    brands: {
      async list() {
        const { data } = await apiClient.get('/admin/brands');
        return data;
      },
      async create(body: any) {
        const { data } = await apiClient.post('/admin/brands', body);
        return data;
      },
      async update(id: string, body: any) {
        const { data } = await apiClient.patch(`/admin/brands/${id}`, body);
        return data;
      },
      async delete(id: string) {
        await apiClient.delete(`/admin/brands/${id}`);
      },
    },

    languages: {
      async getAll() {
        const { data } = await apiClient.get('/admin/languages');
        return data;
      },
      async create(body: any) {
        const { data } = await apiClient.post('/admin/languages', body);
        return data;
      },
      async update(code: string, body: any) {
        const { data } = await apiClient.put(`/admin/languages/${code}`, body);
        return data;
      },
      async delete(code: string) {
        await apiClient.delete(`/admin/languages/${code}`);
      },
      async getTranslations(code: string) {
        const { data } = await apiClient.get(`/admin/languages/${code}/translations`);
        return data;
      },
      async upsertTranslation(code: string, namespace: string, key: string, value: string) {
        const { data } = await apiClient.put(
          `/admin/languages/${code}/translations/${namespace}/${encodeURIComponent(key)}`,
          { value },
        );
        return data;
      },
      async importTranslations(code: string, items: any[]) {
        const { data } = await apiClient.post(`/admin/languages/${code}/translations/import`, items);
        return data;
      },
    },

    cloudflare: {
      async getConfig() {
        const { data } = await apiClient.get('/admin/cloudflare/config');
        return data;
      },
      async saveConfig(body: any) {
        const { data } = await apiClient.put('/admin/cloudflare/config', body);
        return data;
      },
      async purgeAll() {
        const { data } = await apiClient.post('/admin/cloudflare/cache/purge-all');
        return data;
      },
      async getDns() {
        const { data } = await apiClient.get('/admin/cloudflare/dns');
        return data;
      },
      async toggleCdn(enabled: boolean) {
        const { data } = await apiClient.post('/admin/cloudflare/cdn/toggle', { enabled });
        return data;
      },
      async toggleWaf(enabled: boolean) {
        const { data } = await apiClient.post('/admin/cloudflare/waf/toggle', { enabled });
        return data;
      },
    },

    payments: {
      async getGateways() {
        const { data } = await apiClient.get('/admin/payments/gateways');
        return data;
      },
      async updateGateway(provider: string, body: any) {
        const { data } = await apiClient.put(`/admin/payments/gateways/${provider}`, body);
        return data;
      },
      async getTransactions(params?: any) {
        const { data } = await apiClient.get('/admin/payments/transactions', { params });
        return data;
      },
    },

    media: {
      async getLibrary(params?: any) {
        const { data } = await apiClient.get('/admin/media', { params });
        return data;
      },
      async uploadImages(files: File[], folder = 'general') {
        const form = new FormData();
        files.forEach((f) => form.append('files', f));
        form.append('folder', folder);
        const { data } = await apiClient.post('/admin/media/images', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
      },
      async uploadVideo(file: File, folder = 'videos') {
        const form = new FormData();
        form.append('file', file);
        form.append('folder', folder);
        const { data } = await apiClient.post('/admin/media/videos', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
      },
      async delete(id: string) {
        await apiClient.delete(`/admin/media/${id}`);
      },
    },

    seo: {
      async getForEntity(entityType: string, entityId: string, languageCode: string) {
        const { data } = await apiClient.get('/admin/seo', { params: { entityType, entityId, languageCode } });
        return data;
      },
      async upsert(body: any) {
        const { data } = await apiClient.post('/admin/seo', body);
        return data;
      },
      async invalidateSitemap() {
        const { data } = await apiClient.post('/admin/seo/sitemap/invalidate');
        return data;
      },
    },
  },
};
