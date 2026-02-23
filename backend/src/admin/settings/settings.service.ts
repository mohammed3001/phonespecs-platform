// src/admin/settings/settings.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

const CACHE_KEY = 'system:settings:all';
const CACHE_TTL = 300; // 5 minutes

export interface SettingValue {
  key: string;
  value: string;
  group: string;
  type: string;
}

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /** Get ALL settings as a flat key→value map */
  async getAllAsMap(): Promise<Record<string, string>> {
    // Try cache first
    const cached = await this.redis.get(CACHE_KEY);
    if (cached) return JSON.parse(cached);

    const settings = await this.prisma.systemSettings.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;

    await this.redis.set(CACHE_KEY, JSON.stringify(map), CACHE_TTL);
    return map;
  }

  /** Get a single setting value */
  async get(key: string, fallback = ''): Promise<string> {
    const map = await this.getAllAsMap();
    return map[key] ?? fallback;
  }

  /** Get typed value */
  async getTyped<T = string>(key: string, fallback?: T): Promise<T> {
    const setting = await this.prisma.systemSettings.findUnique({ where: { key } });
    if (!setting) return fallback as T;

    switch (setting.type) {
      case 'boolean': return (setting.value === 'true') as unknown as T;
      case 'number':  return Number(setting.value) as unknown as T;
      case 'json':    return JSON.parse(setting.value) as T;
      default:        return setting.value as unknown as T;
    }
  }

  /** Get all settings grouped */
  async getAllGrouped() {
    const settings = await this.prisma.systemSettings.findMany({
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });

    const grouped: Record<string, SettingValue[]> = {};
    for (const s of settings) {
      if (!grouped[s.group]) grouped[s.group] = [];
      // Mask secrets
      grouped[s.group].push({
        key: s.key,
        value: s.type === 'secret' ? '••••••••' : s.value,
        group: s.group,
        type: s.type,
      });
    }
    return grouped;
  }

  /** Upsert a batch of settings (used by Admin Panel) */
  async updateBatch(updates: Record<string, string | boolean | number>): Promise<void> {
    await this.prisma.$transaction(
      Object.entries(updates).map(([key, value]) =>
        this.prisma.systemSettings.upsert({
          where: { key },
          create: {
            key,
            value: String(value),
            group: this.inferGroup(key),
            type: this.inferType(value),
          },
          update: { value: String(value) },
        }),
      ),
    );
    // Invalidate cache
    await this.redis.del(CACHE_KEY);
  }

  /** Upsert single setting */
  async update(key: string, value: string): Promise<void> {
    await this.prisma.systemSettings.upsert({
      where: { key },
      create: { key, value, group: this.inferGroup(key), type: this.inferType(value) },
      update: { value },
    });
    await this.redis.del(CACHE_KEY);
  }

  /** Public-safe settings (no secrets) */
  async getPublicSettings(): Promise<Record<string, string>> {
    const all = await this.prisma.systemSettings.findMany({
      where: {
        type: { not: 'secret' },
        key: {
          in: [
            'site_name', 'site_url', 'site_description', 'logo_url',
            'favicon_url', 'default_locale', 'default_theme', 'icon_library',
            'seo_title_template', 'phones_per_page',
          ],
        },
      },
    });
    const map: Record<string, string> = {};
    for (const s of all) map[s.key] = s.value;
    return map;
  }

  private inferGroup(key: string): string {
    if (key.startsWith('site_') || key.startsWith('logo') || key.startsWith('favicon')) return 'general';
    if (key.startsWith('seo_') || key === 'robots_custom_rules') return 'seo';
    if (key.startsWith('admin_') || key.startsWith('max_') || key.startsWith('lockout')) return 'security';
    if (key.startsWith('redis_') || key.startsWith('cache_') || key.startsWith('cf_')) return 'performance';
    if (key.startsWith('supabase') || key.startsWith('storage') || key.includes('bucket')) return 'storage';
    if (key === 'registration_enabled' || key === 'login_enabled') return 'auth';
    if (key.startsWith('default_') || key.startsWith('icon_')) return 'appearance';
    return 'general';
  }

  private inferType(value: unknown): string {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'object') return 'json';
    return 'string';
  }
}
