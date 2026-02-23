// src/hooks/useSettings.ts
'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.admin.settings.get();
      // Flatten grouped settings to flat map for form use
      const flat: Record<string, any> = {};
      for (const [, items] of Object.entries(data) as any) {
        for (const item of items) {
          flat[toCamelCase(item.key)] = parseValue(item.value, item.type);
        }
      }
      setSettings(flat);
    } catch {
      // silent — defaults used
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateSettings = useCallback(async (updates: Record<string, any>) => {
    // Convert camelCase keys back to snake_case for API
    const snakeUpdates: Record<string, any> = {};
    for (const [k, v] of Object.entries(updates)) {
      snakeUpdates[toSnakeCase(k)] = v;
    }
    await api.admin.settings.update(snakeUpdates);
    setSettings((prev) => ({ ...prev, ...updates }));
    return load(); // refresh
  }, [load]);

  return { settings, isLoading, updateSettings, reload: load };
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function toSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

function parseValue(value: string, type: string): any {
  switch (type) {
    case 'boolean': return value === 'true';
    case 'number': return Number(value);
    case 'json': try { return JSON.parse(value); } catch { return value; }
    default: return value;
  }
}
