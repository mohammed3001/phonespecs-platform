// src/lib/api-admin-extensions.ts
// These extend the main api.ts with admin-specific methods
// (Merged into api.ts in the full build)

// Admin Languages API extension
export const adminLanguagesApi = {
  async getAll() {
    const { data } = await import('./api').then(m => m.apiClient).then(c => c.get('/admin/languages'));
    return data;
  },
  async create(body: any) {
    const { apiClient } = await import('./api');
    const { data } = await apiClient.post('/admin/languages', body);
    return data;
  },
  async update(code: string, body: any) {
    const { apiClient } = await import('./api');
    const { data } = await apiClient.put(`/admin/languages/${code}`, body);
    return data;
  },
  async delete(code: string) {
    const { apiClient } = await import('./api');
    await apiClient.delete(`/admin/languages/${code}`);
  },
  async getTranslations(code: string) {
    const { apiClient } = await import('./api');
    const { data } = await apiClient.get(`/admin/languages/${code}/translations`);
    return data;
  },
  async upsertTranslation(code: string, namespace: string, key: string, value: string) {
    const { apiClient } = await import('./api');
    const { data } = await apiClient.put(`/admin/languages/${code}/translations/${namespace}/${key}`, { value });
    return data;
  },
  async importTranslations(code: string, items: any[]) {
    const { apiClient } = await import('./api');
    const { data } = await apiClient.post(`/admin/languages/${code}/translations/import`, items);
    return data;
  },
};

// Admin Cloudflare API extension
export const adminCloudflareApi = {
  async getConfig() {
    const { apiClient } = await import('./api');
    const { data } = await apiClient.get('/admin/cloudflare/config');
    return data;
  },
  async saveConfig(body: any) {
    const { apiClient } = await import('./api');
    const { data } = await apiClient.put('/admin/cloudflare/config', body);
    return data;
  },
  async purgeAll() {
    const { apiClient } = await import('./api');
    const { data } = await apiClient.post('/admin/cloudflare/cache/purge-all');
    return data;
  },
  async getDns() {
    const { apiClient } = await import('./api');
    const { data } = await apiClient.get('/admin/cloudflare/dns');
    return data;
  },
};
